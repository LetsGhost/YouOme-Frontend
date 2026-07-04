import type { NotificationRecord } from "../../shared/api/backend";

export const noop = async () => {
  void 0;
};

export function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function getInvitePayload(notification: NotificationRecord) {
  return notification.payload && typeof notification.payload === "object" ? notification.payload : {};
}
