import { useCallback, useState } from "react";

import { BackendState, RegisteredJob, RegisteredRoute, fetchJson } from "../../shared/api/backend";

export type AdminBundle = {
  state: BackendState | null;
  routes: RegisteredRoute[];
  jobs: RegisteredJob[];
  loadedAt: string | null;
};

const defaultAdminState: AdminBundle = {
  state: null,
  routes: [],
  jobs: [],
  loadedAt: null,
};

export function useAdminBundleState(backendUrl: string, accessToken: string | undefined) {
  const [admin, setAdmin] = useState<AdminBundle>(defaultAdminState);

  const reloadAdminState = useCallback(async () => {
    const [state, routes, jobs] = await Promise.all([
      fetchJson<BackendState>(`${backendUrl}/api/redis/state`, { token: accessToken }),
      fetchJson<RegisteredRoute[]>(`${backendUrl}/api/redis/routes`, { token: accessToken }),
      fetchJson<RegisteredJob[]>(`${backendUrl}/api/redis/jobs`, { token: accessToken }),
    ]);

    setAdmin({
      state,
      routes,
      jobs,
      loadedAt: new Date().toISOString(),
    });
  }, [backendUrl, accessToken]);

  return { admin, reloadAdminState };
}
