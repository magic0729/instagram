export type MetaOAuthDiagnostics = {
  at: string;
  requestId: string;
  metaUserId?: string | null;
  grantedScopes?: string[];
  granularScopes?: Array<{
    scope: string;
    targetIds?: string[];
  }>;
  permissions?: Array<{
    permission: string;
    status: string;
  }>;
  pages?: Array<{
    id: string;
    name: string;
    hasInstagramBusinessAccount: boolean;
    igUserId: string | null;
    igUsername: string | null;
  }>;
};

type GlobalWithDebug = typeof globalThis & {
  _jiMetaOAuthDebug?: Map<string, MetaOAuthDiagnostics>;
};

function getStore() {
  const g = global as GlobalWithDebug;
  if (!g._jiMetaOAuthDebug) g._jiMetaOAuthDebug = new Map();
  return g._jiMetaOAuthDebug;
}

export function setMetaOAuthDiagnostics(requestId: string, diagnostics: Omit<MetaOAuthDiagnostics, "requestId">) {
  const store = getStore();
  store.set(requestId, { requestId, ...diagnostics });

  // keep the store bounded
  const MAX = 50;
  if (store.size > MAX) {
    const firstKey = store.keys().next().value as string | undefined;
    if (firstKey) store.delete(firstKey);
  }
}

export function getMetaOAuthDiagnostics(requestId: string) {
  return getStore().get(requestId) ?? null;
}

