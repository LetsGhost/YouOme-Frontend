import { useCallback, useEffect, useState } from "react";

import { Group, listGroups } from "../../shared/api/backend";

export function useGroupsState(backendUrl: string, accessToken: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);

  const reloadGroups = useCallback(async () => {
    try {
      const groupsSnapshot = await listGroups(backendUrl, accessToken);
      setGroups(groupsSnapshot);
    } catch {
      setGroups([]);
    }
  }, [backendUrl, accessToken]);

  useEffect(() => {
    void reloadGroups();
  }, [reloadGroups]);

  return { groups, reloadGroups };
}
