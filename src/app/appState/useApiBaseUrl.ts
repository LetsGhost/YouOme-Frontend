import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getApiBaseUrl,
  normalizeBaseUrl,
  setApiBaseUrl as persistApiBaseUrl,
} from "../../shared/api/backend";

export function useApiBaseUrl() {
  const [apiBaseUrl, setApiBaseUrlState] = useState(() => normalizeBaseUrl(getApiBaseUrl()));
  const backendUrl = useMemo(() => normalizeBaseUrl(apiBaseUrl), [apiBaseUrl]);

  useEffect(() => {
    persistApiBaseUrl(backendUrl);
  }, [backendUrl]);

  const setApiBaseUrl = useCallback((nextValue: string) => setApiBaseUrlState(normalizeBaseUrl(nextValue)), []);

  return { apiBaseUrl, backendUrl, setApiBaseUrl };
}
