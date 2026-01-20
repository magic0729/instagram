import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AnalyticsSnapshot } from "@/lib/models/AnalyticsSnapshot";
import { InstagramAccount } from "@/lib/models/InstagramAccount";
import { InstagramMedia } from "@/lib/models/InstagramMedia";

export async function getListedCreators() {
  await connectToDatabase();

  const accounts = await InstagramAccount.find({ isListed: true })
    .sort({ followersCount: -1 })
    .limit(100)
    .select({ username: 1, profilePictureUrl: 1, followersCount: 1, mediaCount: 1, accountType: 1, updatedAt: 1 });

  const accountIds = accounts.map((a) => a._id);
  const latestSnapshots = await AnalyticsSnapshot.aggregate<{
    _id: mongoose.Types.ObjectId;
    followersCount: number;
    engagementRate: number;
    date: string;
  }>([
    { $match: { instagramAccountId: { $in: accountIds } } },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: "$instagramAccountId",
        date: { $first: "$date" },
        followersCount: { $first: "$followersCount" },
        engagementRate: { $first: "$engagementRate" },
      },
    },
  ]);

  const snapshotByAccountId = new Map(
    latestSnapshots.map((s) => [
      s._id.toString(),
      { date: s.date, followersCount: s.followersCount, engagementRate: s.engagementRate },
    ])
  );

  return {
    creators: accounts.map((a) => {
      const snap = snapshotByAccountId.get(a._id.toString()) ?? null;
      return {
        instagramAccountId: a._id.toString(),
        username: a.username,
        profilePictureUrl: a.profilePictureUrl ?? null,
        followersCount: a.followersCount ?? 0,
        mediaCount: a.mediaCount ?? 0,
        accountType: a.accountType ?? null,
        lastSyncedAt: a.updatedAt,
        latestSnapshot: snap,
      };
    }),
  };
}

export async function getCreatorDetail(instagramAccountId: string) {
  await connectToDatabase();

  const account = await InstagramAccount.findById(instagramAccountId).select({
    isListed: 1,
    username: 1,
    profilePictureUrl: 1,
    followersCount: 1,
    mediaCount: 1,
    accountType: 1,
    updatedAt: 1,
  });
  if (!account || !account.isListed) throw new Error("Not found.");

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

  const snapshots = await AnalyticsSnapshot.find({ instagramAccountId: account._id })
    .sort({ date: -1 })
    .limit(30)
    .select({ date: 1, followersCount: 1, engagementRate: 1 });

  return {
    profile: {
      instagramAccountId: account._id.toString(),
      username: account.username,
      profilePictureUrl: account.profilePictureUrl ?? null,
      followersCount: account.followersCount ?? 0,
      mediaCount: account.mediaCount ?? 0,
      accountType: account.accountType ?? null,
      lastSyncedAt: account.updatedAt,
    },
    snapshots: snapshots.map((s) => ({
      date: s.date,
      followersCount: s.followersCount ?? 0,
      engagementRate: s.engagementRate ?? 0,
    })),
    media: media.map((m) => ({
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

