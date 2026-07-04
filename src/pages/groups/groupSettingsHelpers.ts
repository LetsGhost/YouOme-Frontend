import type { FriendSummary } from "../../shared/api/backend";

export const noop = async () => {
  void 0;
};

export function resolveFriendKey(friend: FriendSummary) {
  return friend.id || friend.email;
}
