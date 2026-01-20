import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadDotEnv(filepath) {
  if (!fs.existsSync(filepath)) return;
  const raw = fs.readFileSync(filepath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [k, ...rest] = arg.slice(2).split("=");
    out[k] = rest.join("=") || true;
  }
  return out;
}

async function main() {
  const root = path.resolve(import.meta.dirname, "..");
  loadDotEnv(path.join(root, ".env.local"));
  loadDotEnv(path.join(root, ".env"));

  const args = parseArgs(process.argv.slice(2));
  const email = (args.email || process.env.SEED_BRAND_EMAIL || "").toString().trim().toLowerCase();
  const password = (args.password || process.env.SEED_BRAND_PASSWORD || "").toString();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI. Set it in .env or export it before running this script.");
  }
  if (!email) throw new Error('Missing email. Use "--email=you@example.com" or set SEED_BRAND_EMAIL.');
  if (!password || password.length < 8) {
    throw new Error('Missing/weak password. Use "--password=..." (min 8 chars) or set SEED_BRAND_PASSWORD.');
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });

  const userSchema = new mongoose.Schema(
    {
      role: { type: String, enum: ["creator", "brand"], required: true, index: true },
      email: { type: String, lowercase: true, trim: true },
      passwordHash: { type: String },
    },
    { timestamps: true, collection: "users" }
  );

  userSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { role: "brand", email: { $type: "string" } } }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

  const existing = await User.findOne({ role: "brand", email });
  if (existing) {
    await User.updateOne({ _id: existing._id }, { $set: { passwordHash } });
    console.log(`Updated brand user password: ${email}`);
  } else {
    await User.create({ role: "brand", email, passwordHash });
    console.log(`Created brand user: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

