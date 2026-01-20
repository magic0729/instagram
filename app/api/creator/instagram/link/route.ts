import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/getAuth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CreatorMetaToken } from "@/lib/models/CreatorMetaToken";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { User } from "@/lib/models/User";
import { fetchInstagramBusinessAccount, fetchInstagramProfile } from "@/lib/instagram/meta";

export async function POST(req: Request) {
  const auth = await getAuth("creator");
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  await connectToDatabase();

  const metaToken = await CreatorMetaToken.findOne({ creatorUserId: auth.user._id }).select("+accessToken");
  if (!metaToken?.accessToken) {
    return NextResponse.redirect(new URL("/creator/dashboard?notice=needs_instagram", req.url));
  }

  try {
    const { igUserId, pageId } = await fetchInstagramBusinessAccount(metaToken.accessToken);
    const profile = await fetchInstagramProfile(igUserId, metaToken.accessToken);

    const instagramAccount = await InstagramAccount.findOne({ igUserId: profile.id }).select("+accessToken");
    let instagramAccountId = instagramAccount?._id ?? null;

    if (!instagramAccount) {
      const created = await InstagramAccount.create({
        creatorUserId: auth.user._id,
        igUserId: profile.id,
        username: profile.username,
        profilePictureUrl: profile.profile_picture_url,
        accountType: undefined,
        followersCount: profile.followers_count ?? 0,
        mediaCount: profile.media_count ?? 0,
        accessToken: metaToken.accessToken,
        tokenExpiresAt: metaToken.tokenExpiresAt,
        metaUserId: auth.user.creatorMetaUserId ?? undefined,
        pageId,
      });
      instagramAccountId = created._id;
    } else {
      await InstagramAccount.updateOne(
        { _id: instagramAccount._id },
        {
          $set: {
            creatorUserId: auth.user._id,
            username: profile.username,
            profilePictureUrl: profile.profile_picture_url,
            accountType: instagramAccount.accountType,
            followersCount: profile.followers_count ?? instagramAccount.followersCount,
            mediaCount: profile.media_count ?? instagramAccount.mediaCount,
            accessToken: metaToken.accessToken,
            tokenExpiresAt: metaToken.tokenExpiresAt,
            pageId,
          },
        }
      );
      instagramAccountId = instagramAccount._id;
    }

    await User.updateOne(
      { _id: auth.user._id },
      {
        $set: {
          instagramAccountId,
          creatorOnboarding: { status: "connected", lastCheckedAt: new Date() },
        },
      }
    );

    return NextResponse.redirect(new URL("/creator/dashboard", req.url));
  } catch (e) {
    await User.updateOne(
      { _id: auth.user._id },
      {
        $set: {
          creatorOnboarding: {
            status: "needs_page_connection",
            lastError: e instanceof Error ? e.message : "Link failed.",
            lastCheckedAt: new Date(),
          },
        },
      }
    );
    return NextResponse.redirect(new URL("/creator/dashboard?notice=needs_instagram", req.url));
  }
}
