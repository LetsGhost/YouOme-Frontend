import { Check, Clock, X } from "lucide-react";
import { Box, Button, Card, CardContent, Divider, Typography } from "@mui/material";

import { resolveAvatarUrl } from "../../shared/api/backend";
import { formatTimestamp } from "../../shared/lib/format";
import { AvatarUploader } from "../../widgets/avatar/AvatarUploader";
import { noop } from "./friendsUtils";
import { microLabelSx } from "./friendsStyles";

export type PendingInvite = {
  id: string;
  inviteId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatarUrl: string;
  createdAt: string;
  readAt?: string | null;
};

export function PendingInvitesCard({
  invites,
  isSubmitting,
  backendUrl,
  accessToken,
  onRespond,
}: {
  invites: PendingInvite[];
  isSubmitting: boolean;
  backendUrl: string;
  accessToken?: string;
  onRespond: (notificationId: string, inviteId: string, accept: boolean) => void;
}) {
  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Clock size={18} color="var(--color-warning)" strokeWidth={2} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Pending requests
            </Typography>
            <Typography sx={microLabelSx}>
              {invites.length} request{invites.length === 1 ? "" : "s"} waiting
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "var(--color-border)" }} />

        {invites.length > 0 ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {invites.map((invite) => (
              <Card
                key={invite.id}
                variant="outlined"
                sx={{ bgcolor: "var(--color-surface-2)", border: "1px solid var(--color-border)", boxShadow: "none" }}
              >
                <CardContent sx={{ p: 2, display: "grid", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
                      <AvatarUploader
                        src={resolveAvatarUrl(backendUrl, invite.fromUserAvatarUrl)}
                        token={accessToken}
                        fallback={invite.fromUserName?.[0] || "?"}
                        size={40}
                        onUpload={noop}
                        onRemove={noop}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--color-ink)" }} noWrap>
                          {invite.fromUserName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--color-muted)" }} noWrap>
                          {invite.fromUserEmail || "Friend request sent to your account"}
                        </Typography>
                        {invite.createdAt && (
                          <Typography
                            sx={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10.5,
                              color: "var(--color-muted)",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {formatTimestamp(invite.createdAt)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "var(--radius-pill)",
                        bgcolor: "var(--color-accent-soft-bg)",
                        color: "var(--color-accent-soft-ink)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Request
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      onClick={() => onRespond(invite.id, invite.inviteId, false)}
                      disabled={isSubmitting}
                      startIcon={<X size={16} strokeWidth={2} />}
                      sx={{
                        borderColor: "var(--color-danger-border)",
                        color: "var(--color-danger)",
                        "&:hover": {
                          borderColor: "var(--color-danger)",
                          bgcolor: "var(--color-danger-soft-bg)",
                        },
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => onRespond(invite.id, invite.inviteId, true)}
                      disabled={isSubmitting}
                      startIcon={<Check size={16} strokeWidth={2} />}
                      sx={{
                        bgcolor: "var(--color-accent)",
                        color: "var(--color-accent-contrast)",
                        "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                      }}
                    >
                      Accept
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Clock size={48} strokeWidth={1.6} color="var(--color-muted-3)" style={{ marginBottom: 12 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
              No pending requests
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Incoming requests will appear here and in notifications.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
