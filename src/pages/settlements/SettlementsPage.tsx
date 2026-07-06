import { Link as RouterLink } from "react-router-dom";
import { Send, Check, Wallet, ArrowUpRight, ArrowDownLeft, Scale, History } from "lucide-react";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";

import { formatMoney } from "../../shared/lib/format";
import { LoadingBlock } from "../../shared/ui/InlineSpinner";
import { useSettlementsData } from "./useSettlementsData";

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

export function SettlementsPage() {
  const { rows, isLoading, error, busyId, isBulkBusy, handleMarkPaid, handleApprove, handleMarkAllPaid, handleApproveAll } =
    useSettlementsData();

  const outgoing = rows.filter((row) => row.direction === "outgoing");
  const incoming = rows.filter((row) => row.direction === "incoming");
  const youOwe = outgoing.reduce((sum, row) => sum + row.amount, 0);
  const owedToYou = incoming.reduce((sum, row) => sum + row.amount, 0);
  const net = owedToYou - youOwe;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-sm)",
              bgcolor: "var(--color-accent-soft-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Wallet size={20} color="var(--color-accent-soft-ink)" strokeWidth={2} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-ink)" }}>
              Settlements
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
              Manage payments and settle debts
            </Typography>
          </Box>
        </Box>

        <Button
          component={RouterLink}
          to="/settlements/history"
          startIcon={<History size={16} strokeWidth={2} />}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)", borderColor: "var(--color-border-strong)" }}
        >
          History
        </Button>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
        <Card sx={{ bgcolor: "var(--color-surface-2)" }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  bgcolor: "var(--color-danger-soft-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArrowUpRight size={15} color="var(--color-danger)" strokeWidth={2} />
              </Box>
              <Typography sx={microLabelSx}>You owe</Typography>
            </Box>
            <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-danger)", mb: 0.5 }}>
              {formatMoney(youOwe)}
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              {outgoing.length} pending {outgoing.length === 1 ? "payment" : "payments"}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: "var(--color-surface-2)" }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  bgcolor: "var(--color-success-soft-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArrowDownLeft size={15} color="var(--color-success)" strokeWidth={2} />
              </Box>
              <Typography sx={microLabelSx}>Owed to you</Typography>
            </Box>
            <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-success)", mb: 0.5 }}>
              {formatMoney(owedToYou)}
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              {incoming.length} pending {incoming.length === 1 ? "payment" : "payments"}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: "var(--color-surface-2)" }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  bgcolor: "var(--color-accent-soft-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Scale size={15} color="var(--color-accent-soft-ink)" strokeWidth={2} />
              </Box>
              <Typography sx={microLabelSx}>Net balance</Typography>
            </Box>
            <Typography sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-accent)", mb: 0.5 }}>
              {formatMoney(net)}
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              {net >= 0 ? `You're owed ${formatMoney(net)} total` : `You owe ${formatMoney(-net)} total`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {isLoading ? (
        <LoadingBlock label="Loading settlements…" />
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {outgoing.length > 0 && (
              <Button
                onClick={() => void handleMarkAllPaid()}
                disabled={isBulkBusy}
                startIcon={<Send size={16} strokeWidth={2} />}
                sx={{
                  bgcolor: "var(--color-accent)",
                  color: "var(--color-accent-contrast)",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                }}
              >
                I paid everything
              </Button>
            )}
            {incoming.length > 0 && (
              <Button
                onClick={() => void handleApproveAll()}
                disabled={isBulkBusy}
                startIcon={<Check size={16} strokeWidth={2.6} />}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 700, color: "var(--color-ink)", borderColor: "var(--color-border-strong)" }}
              >
                Approve all
              </Button>
            )}
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: "var(--color-ink)" }}>
              Open settlements
            </Typography>

            {rows.length === 0 ? (
              <Typography variant="body2" sx={{ color: "var(--color-muted)" }}>
                Nothing to settle right now.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rows.map((row) => {
                  const isYou = row.direction === "outgoing";
                  const isBusy = busyId === row._id;

                  return (
                    <Card key={row._id} sx={{ bgcolor: "var(--color-surface-2)", boxShadow: "none" }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "var(--radius-sm)",
                                bgcolor: isYou ? "var(--color-danger-soft-bg)" : "var(--color-success-soft-bg)",
                                color: isYou ? "var(--color-danger)" : "var(--color-success)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isYou ? <Send size={18} strokeWidth={2} /> : <Check size={18} strokeWidth={2} />}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-ink)" }}>
                                {isYou ? "Pay" : "Receive from"}{" "}
                                <span style={{ color: "var(--color-accent-strong-ink)" }}>{row.counterpartName}</span>
                              </Typography>
                              <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block", mt: 0.5 }}>
                                {row.groupName}
                              </Typography>
                            </Box>
                          </Box>

                          <Typography
                            sx={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              color: isYou ? "var(--color-danger)" : "var(--color-success)",
                              flexShrink: 0,
                            }}
                          >
                            {isYou ? "-" : "+"}
                            {formatMoney(row.amount)}
                          </Typography>
                        </Box>

                        <Button
                          variant={isYou ? "contained" : "outlined"}
                          fullWidth
                          disabled={isBusy}
                          startIcon={isYou ? <Send size={16} strokeWidth={2} /> : <Check size={16} strokeWidth={2.6} />}
                          onClick={() => void (isYou ? handleMarkPaid(row._id) : handleApprove(row._id))}
                          sx={
                            isYou
                              ? {
                                  bgcolor: "var(--color-accent)",
                                  color: "var(--color-accent-contrast)",
                                  fontWeight: 700,
                                  textTransform: "none",
                                  "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                                }
                              : { textTransform: "none", fontWeight: 700, color: "var(--color-ink)", borderColor: "var(--color-border-strong)" }
                          }
                        >
                          {isYou ? "I paid" : "Approve"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
