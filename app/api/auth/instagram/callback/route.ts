import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import { setAuthCookie } from "@/lib/auth/cookies";
import { signAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CreatorMetaToken } from "@/lib/models/CreatorMetaToken";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { User } from "@/lib/models/User";
import {
  collectMetaDiagnostics,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchInstagramBusinessAccount,
  fetchInstagramProfile,
  fetchMetaUserId,
} from "@/lib/instagram/meta";
import { setMetaOAuthDiagnostics } from "@/lib/instagram/oauthDebugStore";

const IG_OAUTH_STATE_COOKIE = "ji_ig_oauth_state";

function errorRedirect(message: string, requestId: string) {
  const url = new URL("/creator/login", process.env.APP_BASE_URL ?? "http://localhost:3000");
  url.searchParams.set("error", message);
  url.searchParams.set("rid", requestId);
  return NextResponse.redirect(url.toString());
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(IG_OAUTH_STATE_COOKIE)?.value;

  cookieStore.set(IG_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });

  if (!code) return errorRedirect("Missing OAuth code.", requestId);
  if (!state || !expectedState || state !== expectedState) return errorRedirect("Invalid OAuth state.", requestId);

  try {
    const shortLived = await exchangeCodeForShortLivedToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const tokenExpiresAt = new Date(Date.now() + longLived.expires_in * 1000);

    const metaUser = await fetchMetaUserId(longLived.access_token);
    let igUserId: string | null = null;
    let pageId: string | null = null;
    try {
      const res = await fetchInstagramBusinessAccount(longLived.access_token);
      igUserId = res.igUserId;
      pageId = res.pageId;
    } catch (inner) {
      if (inner instanceof Error && inner.message.includes("No Instagram Business/Creator account found")) {
        const diag = await collectMetaDiagnostics(longLived.access_token).catch(() => null);
        if (diag) {
          setMetaOAuthDiagnostics(requestId, { at: new Date().toISOString(), metaUserId: metaUser.id, ...diag });
          console.error("[JustInfluence][Meta] Diagnostics stored for request.", { requestId });

          const igTargetId =
            diag.granularScopes?.find((g) => g.scope === "instagram_basic")?.targetIds?.[0] ??
            diag.granularScopes?.find((g) => g.scope === "instagram_manage_insights")?.targetIds?.[0] ??
            null;

          // Fallback: some setups grant Instagram granular access but do not expose instagram_business_account under /me/accounts.
          if (igTargetId) {
            console.warn("[JustInfluence][Meta] Using granular-scope IG user id fallback.", { requestId, igTargetId });
            igUserId = igTargetId;
            pageId = null;
          } else {
            await connectToDatabase();
            const creator =
              (await User.findOne({ role: "creator", creatorMetaUserId: metaUser.id })) ??
              (await User.create({ role: "creator", creatorMetaUserId: metaUser.id }));

            await CreatorMetaToken.updateOne(
              { creatorUserId: creator._id },
              { $set: { creatorUserId: creator._id, accessToken: longLived.access_token, tokenExpiresAt } },
              { upsert: true }
            );

            await User.updateOne(
              { _id: creator._id },
              {
                $set: {
                  role: "creator",
                  creatorMetaUserId: metaUser.id,
                  creatorOnboarding: {
                    status: "needs_page_connection",
                    lastError: inner.message,
                    lastCheckedAt: new Date(),
                  },
                },
              }
            );

            await setAuthCookie(signAuthToken({ sub: creator._id.toString(), role: "creator" }));
            return NextResponse.redirect(new URL(`/creator/dashboard?notice=needs_instagram&rid=${requestId}`, req.url));
          }
        } else {
          await connectToDatabase();
          const creator =
            (await User.findOne({ role: "creator", creatorMetaUserId: metaUser.id })) ??
            (await User.create({ role: "creator", creatorMetaUserId: metaUser.id }));

          await CreatorMetaToken.updateOne(
            { creatorUserId: creator._id },
            { $set: { creatorUserId: creator._id, accessToken: longLived.access_token, tokenExpiresAt } },
            { upsert: true }
          );

          await User.updateOne(
            { _id: creator._id },
            {
              $set: {
                role: "creator",
                creatorMetaUserId: metaUser.id,
                creatorOnboarding: {
                  status: "needs_page_connection",
                  lastError: inner.message,
                  lastCheckedAt: new Date(),
                },
              },
            }
          );

          await setAuthCookie(signAuthToken({ sub: creator._id.toString(), role: "creator" }));
          return NextResponse.redirect(new URL(`/creator/dashboard?notice=needs_instagram&rid=${requestId}`, req.url));
        }
        // If we got here and have an igUserId fallback, continue the flow instead of failing login.
        if (!igUserId) {
          throw inner;
        }
      } else {
        throw inner;
      }
    }
    if (!igUserId) {
      // Should not happen, but keeps types safe.
      throw new Error("Instagram account could not be resolved.");
    }

    const profile = await fetchInstagramProfile(igUserId, longLived.access_token);

    await connectToDatabase();

    let instagramAccount = await InstagramAccount.findOne({ igUserId }).select("+accessToken");
    let userId: string;

    if (!instagramAccount) {
      const creator = await User.create({
        role: "creator",
        creatorMetaUserId: metaUser.id,
        creatorOnboarding: { status: "connected", lastCheckedAt: new Date() },
      });
      instagramAccount = await InstagramAccount.create({
        creatorUserId: creator._id,
        igUserId: profile.id,
        username: profile.username,
        profilePictureUrl: profile.profile_picture_url,
        accountType: undefined,
        followersCount: profile.followers_count ?? 0,
        mediaCount: profile.media_count ?? 0,
        accessToken: longLived.access_token,
        tokenExpiresAt,
        metaUserId: metaUser.id,
        pageId: pageId ?? undefined,
      });
      await User.findByIdAndUpdate(creator._id, {
        instagramAccountId: instagramAccount._id,
        creatorMetaUserId: metaUser.id,
        creatorOnboarding: { status: "connected", lastCheckedAt: new Date() },
      });
      userId = creator._id.toString();
    } else {
      userId = instagramAccount.creatorUserId.toString();
      await InstagramAccount.updateOne(
        { _id: instagramAccount._id },
        {
          $set: {
            username: profile.username,
            profilePictureUrl: profile.profile_picture_url,
            accountType: instagramAccount.accountType,
            followersCount: profile.followers_count ?? instagramAccount.followersCount,
            mediaCount: profile.media_count ?? instagramAccount.mediaCount,
            accessToken: longLived.access_token,
            tokenExpiresAt,
            metaUserId: metaUser.id,
            ...(pageId ? { pageId } : {}),
          },
        }
      );
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            role: "creator",
            instagramAccountId: instagramAccount._id,
            creatorMetaUserId: metaUser.id,
            creatorOnboarding: { status: "connected", lastCheckedAt: new Date() },
          },
        }
      );
    }

    await setAuthCookie(signAuthToken({ sub: userId, role: "creator" }));
    return NextResponse.redirect(new URL("/creator/dashboard", req.url));
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("[JustInfluence][Meta] OAuth callback failed with AxiosError.", {
        requestId,
        status: e.response?.status ?? null,
        data: e.response?.data ?? null,
        // Avoid logging request params (may contain access tokens).
        url: e.config?.url ?? null,
        baseURL: e.config?.baseURL ?? null,
      });
    } else {
      console.error("[JustInfluence] OAuth callback failed.", { requestId, error: e });
    }
    const msg = e instanceof Error ? e.message : "Instagram login failed.";
    return errorRedirect(msg, requestId);
  }
}
