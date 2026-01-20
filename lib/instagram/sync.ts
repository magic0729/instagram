import { connectToDatabase } from "@/lib/db/mongoose";
import { AnalyticsSnapshot } from "@/lib/models/AnalyticsSnapshot";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { InstagramMedia } from "@/lib/models/InstagramMedia";
import {
  fetchInstagramMediaList,
  fetchInstagramProfile,
  fetchMediaInsights,
  renewLongLivedToken,
} from "@/lib/instagram/meta";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function syncInstagramAccount(instagramAccountId: string) {
  await connectToDatabase();

  const account = await InstagramAccount.findById(instagramAccountId).select("+accessToken");
  if (!account?.accessToken) throw new Error("Instagram account not found or missing token.");

  let accessToken = account.accessToken;
  let tokenExpiresAt = account.tokenExpiresAt;

  const willExpireSoon = tokenExpiresAt.getTime() < Date.now() + 3 * 24 * 60 * 60 * 1000;
  if (willExpireSoon) {
    try {
      const renewed = await renewLongLivedToken(accessToken);
      accessToken = renewed.access_token;
      tokenExpiresAt = new Date(Date.now() + renewed.expires_in * 1000);
      await InstagramAccount.updateOne({ _id: account._id }, { $set: { accessToken, tokenExpiresAt } });
    } catch {
      // Best-effort refresh. Continue if the current token is still valid.
    }
  }

  const profile = await fetchInstagramProfile(account.igUserId, accessToken);
  await InstagramAccount.updateOne(
    { _id: account._id },
    {
      $set: {
        username: profile.username,
        profilePictureUrl: profile.profile_picture_url,
        accountType: account.accountType,
        followersCount: profile.followers_count ?? account.followersCount,
        mediaCount: profile.media_count ?? account.mediaCount,
      },
    }
  );

  const media = await fetchInstagramMediaList(account.igUserId, accessToken);

  let upserted = 0;
  for (const m of media) {
    let insights: Record<string, number> | undefined;
    try {
      insights = await fetchMediaInsights(m.id, accessToken);
    } catch {
      insights = undefined;
    }

    await InstagramMedia.updateOne(
      { igMediaId: m.id },
      {
        $set: {
          instagramAccountId: account._id,
          igMediaId: m.id,
          caption: m.caption,
          mediaType: m.media_type,
          mediaUrl: m.media_url,
          thumbnailUrl: m.thumbnail_url,
          permalink: m.permalink,
          timestamp: new Date(m.timestamp),
          likeCount: m.like_count ?? 0,
          commentsCount: m.comments_count ?? 0,
          ...(insights
            ? {
                insights: {
                  reach: insights.reach,
                  impressions: insights.impressions,
                  engagement: insights.engagement,
                  saved: insights.saved,
                  videoViews: insights.video_views,
                },
              }
            : {}),
        },
      },
      { upsert: true }
    );
    upserted += 1;
  }

  const recent = await InstagramMedia.find({ instagramAccountId: account._id })
    .sort({ timestamp: -1 })
    .limit(20)
    .select({ likeCount: 1, commentsCount: 1 });

  const followers = profile.followers_count ?? account.followersCount ?? 0;
  const avgEngagement =
    recent.length === 0
      ? 0
      : recent.reduce((sum, r) => sum + (r.likeCount ?? 0) + (r.commentsCount ?? 0), 0) / recent.length;
  const engagementRate = followers > 0 ? (avgEngagement / followers) * 100 : 0;

  await AnalyticsSnapshot.updateOne(
    { instagramAccountId: account._id, date: todayKey() },
    {
      $set: {
        followersCount: followers,
        mediaCount: profile.media_count ?? account.mediaCount ?? 0,
        engagementRate,
      },
    },
    { upsert: true }
  );

  return { upserted, followersCount: followers, engagementRate };
}
