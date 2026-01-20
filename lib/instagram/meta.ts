import axios from "axios";
import { getEnv } from "@/lib/env";

const graph = axios.create({
  baseURL: "https://graph.facebook.com/v20.0",
  timeout: 30_000,
});

export async function collectMetaDiagnostics(accessToken: string) {
  const env = getEnv();
  const appToken = `${env.META_CLIENT_ID}|${env.META_CLIENT_SECRET}`;

  const safeGet = async <T>(path: string, params: Record<string, string>) => {
    const { data } = await graph.get<T>(path, { params });
    return data;
  };

  const [debug, permissions, accounts] = await Promise.allSettled([
    safeGet<{
      data: {
        app_id?: string;
        type?: string;
        application?: string;
        expires_at?: number;
        is_valid?: boolean;
        user_id?: string;
        scopes?: string[];
        granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
      };
    }>("/debug_token", { input_token: accessToken, access_token: appToken }),
    safeGet<{ data: Array<{ permission: string; status: string }> }>("/me/permissions", { access_token: accessToken }),
    safeGet<{ data: Array<{ id: string; name: string; instagram_business_account?: { id: string; username?: string } }> }>(
      "/me/accounts",
      { access_token: accessToken, fields: "id,name,instagram_business_account{id,username}", limit: "50" }
    ),
  ]);

  const grantedScopes =
    debug.status === "fulfilled" ? (debug.value?.data?.scopes ?? []).filter((s) => typeof s === "string") : [];
  const granularScopes =
    debug.status === "fulfilled"
      ? (debug.value?.data?.granular_scopes ?? []).map((g) => ({ scope: g.scope, targetIds: g.target_ids ?? [] }))
      : [];

  const perms =
    permissions.status === "fulfilled"
      ? (permissions.value?.data ?? []).map((p) => ({ permission: p.permission, status: p.status }))
      : [];

  const pages =
    accounts.status === "fulfilled"
      ? (accounts.value?.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          hasInstagramBusinessAccount: Boolean(p.instagram_business_account?.id),
          igUserId: p.instagram_business_account?.id ?? null,
          igUsername: p.instagram_business_account?.username ?? null,
        }))
      : [];

  return { grantedScopes, granularScopes, permissions: perms, pages };
}

export function buildMetaOAuthUrl(state: string) {
  const env = getEnv();
  const scope =
    env.META_OAUTH_SCOPES ??
    [
      "instagram_basic",
      "pages_show_list",
      "instagram_manage_insights",
      "pages_read_engagement",
    ].join(",");

  const url = new URL("https://www.facebook.com/v20.0/dialog/oauth");
  url.searchParams.set("client_id", env.META_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.META_REDIRECT_URI);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  return url.toString();
}

export async function exchangeCodeForShortLivedToken(code: string) {
  const env = getEnv();
  const { data } = await graph.get("/oauth/access_token", {
    params: {
      client_id: env.META_CLIENT_ID,
      client_secret: env.META_CLIENT_SECRET,
      redirect_uri: env.META_REDIRECT_URI,
      code,
    },
  });

  return data as { access_token: string; token_type: string; expires_in: number };
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const env = getEnv();
  const { data } = await graph.get("/oauth/access_token", {
    params: {
      grant_type: "fb_exchange_token",
      client_id: env.META_CLIENT_ID,
      client_secret: env.META_CLIENT_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });

  return data as { access_token: string; token_type: string; expires_in: number };
}

export async function renewLongLivedToken(currentToken: string) {
  return exchangeForLongLivedToken(currentToken);
}

export async function fetchMetaUserId(accessToken: string) {
  const { data } = await graph.get("/me", { params: { access_token: accessToken } });
  return data as { id: string };
}

export async function fetchInstagramBusinessAccount(accessToken: string) {
  const { data } = await graph.get("/me/accounts", {
    params: {
      access_token: accessToken,
      fields: "id,name,instagram_business_account{id,username}",
      limit: 50,
    },
  });

  const pages: Array<{
    id: string;
    name: string;
    instagram_business_account?: { id: string; username?: string };
  }> = data?.data ?? [];

  const match = pages.find((p) => p.instagram_business_account?.id);
  if (!match?.instagram_business_account?.id) {
    console.error("[JustInfluence][Meta] No instagram_business_account found on /me/accounts.", {
      pagesFound: pages.length,
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        hasInstagramBusinessAccount: Boolean(p.instagram_business_account?.id),
        igUserId: p.instagram_business_account?.id ?? null,
        igUsername: p.instagram_business_account?.username ?? null,
      })),
    });
    throw new Error(
      "No Instagram Business/Creator account found. Ensure your Instagram account is connected to a Facebook Page."
    );
  }

  return { pageId: match.id, igUserId: match.instagram_business_account.id };
}

export async function fetchInstagramProfile(igUserId: string, accessToken: string) {
  const { data } = await graph.get(`/${igUserId}`, {
    params: {
      access_token: accessToken,
      // `account_type` is not available for some IG user node types depending on how the id was resolved.
      fields: "id,username,profile_picture_url,followers_count,media_count",
    },
  });

  return data as {
    id: string;
    username: string;
    profile_picture_url?: string;
    followers_count?: number;
    media_count?: number;
  };
}

export async function fetchInstagramMediaList(igUserId: string, accessToken: string) {
  const { data } = await graph.get(`/${igUserId}/media`, {
    params: {
      access_token: accessToken,
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit: 50,
    },
  });

  return (data?.data ?? []) as Array<{
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
  }>;
}

export async function fetchMediaInsights(mediaId: string, accessToken: string) {
  const { data } = await graph.get(`/${mediaId}/insights`, {
    params: {
      access_token: accessToken,
      metric: "impressions,reach,engagement,saved,video_views",
    },
  });

  const out: Record<string, number> = {};
  for (const metric of data?.data ?? []) {
    const name = metric?.name;
    const value = metric?.values?.[0]?.value;
    if (typeof name === "string" && typeof value === "number") out[name] = value;
  }
  return out as Partial<{
    impressions: number;
    reach: number;
    engagement: number;
    saved: number;
    video_views: number;
  }>;
}
