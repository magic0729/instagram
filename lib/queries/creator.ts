import { connectToDatabase } from "@/lib/db/mongoose";
import { AnalyticsSnapshot } from "@/lib/models/AnalyticsSnapshot";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { InstagramMedia } from "@/lib/models/InstagramMedia";

export async function getCreatorOverview(instagramAccountId: string) {
  await connectToDatabase();

  const account = await InstagramAccount.findById(instagramAccountId).select({
    username: 1,
    profilePictureUrl: 1,
    followersCount: 1,
    mediaCount: 1,
    accountType: 1,
    updatedAt: 1,
  });
  if (!account) throw new Error("Instagram not connected.");

  const media = await InstagramMedia.find({ instagramAccountId: account._id })
    .sort({ timestamp: -1 })
    .limit(20)
    .select({ likeCount: 1, commentsCount: 1 });

  const followers = account.followersCount ?? 0;
  const avgEngagement =
    media.length === 0
      ? 0
      : media.reduce((sum, r) => sum + (r.likeCount ?? 0) + (r.commentsCount ?? 0), 0) / media.length;
  const engagementRate = followers > 0 ? (avgEngagement / followers) * 100 : 0;

  const snapshots = await AnalyticsSnapshot.find({ instagramAccountId: account._id })
    .sort({ date: -1 })
    .limit(30)
    .select({ date: 1, followersCount: 1, engagementRate: 1 });

  return {
    profile: {
      id: account._id.toString(),
      username: account.username,
      profilePictureUrl: account.profilePictureUrl ?? null,
      followersCount: followers,
      mediaCount: account.mediaCount ?? 0,
      accountType: account.accountType ?? null,
      engagementRate,
      lastSyncedAt: account.updatedAt,
    },
    snapshots: snapshots.map((s) => ({
      date: s.date,
      followersCount: s.followersCount ?? 0,
      engagementRate: s.engagementRate ?? 0,
    })),
  };
}

export async function getCreatorMedia(instagramAccountId: string) {
  await connectToDatabase();

  const account = await InstagramAccount.findById(instagramAccountId).select({ _id: 1 });
  if (!account) throw new Error("Instagram not connected.");

  const media = await InstagramMedia.find({ instagramAccountId: account._id })
    .sort({ timestamp: -1 })
    .limit(25)
    .select({
      igMediaId: 1,
      caption: 1,
      mediaType: 1,
      mediaUrl: 1,
      thumbnailUrl: 1,
      permalink: 1,
      timestamp: 1,
      likeCount: 1,
      commentsCount: 1,
      insights: 1,
    });

  return {
    items: media.map((m) => ({
      id: m.igMediaId,
      caption: m.caption ?? null,
      mediaType: m.mediaType,
      mediaUrl: m.mediaUrl ?? null,
      thumbnailUrl: m.thumbnailUrl ?? null,
      permalink: m.permalink ?? null,
      timestamp: m.timestamp,
      likeCount: m.likeCount ?? 0,
      commentsCount: m.commentsCount ?? 0,
      insights: m.insights ?? null,
    })),
  };
}

