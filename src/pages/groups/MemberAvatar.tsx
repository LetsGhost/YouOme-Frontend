import { Avatar } from "@mui/material";

import { resolveAvatarUrl, type GroupMember } from "../../shared/api/backend";
import { useAuthenticatedImage } from "../../shared/lib/useAuthenticatedImage";
import { getMemberLabel } from "./groupDetailsHelpers";

export function MemberAvatar({
  backendUrl,
  token,
  member,
  size,
}: {
  backendUrl: string;
  token?: string;
  member: GroupMember;
  size: number;
}) {
  const imageUrl = useAuthenticatedImage(resolveAvatarUrl(backendUrl, member.avatarUrl), token);

  return (
    <Avatar src={imageUrl ?? undefined} alt={getMemberLabel(member)} sx={{ width: size, height: size, fontSize: size / 2.5 }}>
      {member.avatar || member.name?.[0] || "?"}
    </Avatar>
  );
}
