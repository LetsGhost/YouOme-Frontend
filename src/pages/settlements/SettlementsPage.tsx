import { Send, Check, Wallet, ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";
import { useState } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";

const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

export function SettlementsPage() {
  const [settlements] = useState([
    {
      id: "1",
      from: "You",
      to: "John Smith",
      amount: "€ 65.50",
      reason: "Gas & tolls - Weekend Trip",
      status: "pending",
      date: "Tomorrow",
    },
    {
      id: "2",
      from: "Sarah",
      to: "You",
      amount: "€ 45.00",
      reason: "Groceries - Apartment Expenses",
      status: "pending",
      date: "Today",
    },
    {
      id: "3",
      from: "You",
      to: "Emma",
      amount: "€ 30.00",
      reason: "Dinner - Dinner Nights",
      status: "settled",
      date: "Yesterday",
    },
  ]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
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

      {/* Summary Stats */}
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
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-danger)", mb: 0.5 }}
            >
              € 95.50
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              2 pending payments
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
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-success)", mb: 0.5 }}
            >
              € 45.00
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              1 pending payment
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
            <Typography
              sx={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-accent)", mb: 0.5 }}
            >
              € -50.50
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--color-muted)" }}>
              You owe €50.50 total
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Settlements List */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: "var(--color-ink)" }}>
          Recent Transactions
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {settlements.map((settlement) => {
            const isYou = settlement.from === "You";
            const isSettled = settlement.status === "settled";
            const showPayButton = settlement.status === "pending" && isYou;

            return (
              <Card key={settlement.id} sx={{ bgcolor: "var(--color-surface-2)", boxShadow: "none" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      mb: showPayButton ? 1.5 : 0,
                    }}
                  >
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
                          <span style={{ color: "var(--color-accent-strong-ink)" }}>{settlement.to}</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: "var(--color-muted)", display: "block", mt: 0.5 }}>
                          {settlement.reason}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: isYou ? "var(--color-danger)" : "var(--color-success)",
                        }}
                      >
                        {isYou ? "-" : "+"}
                        {settlement.amount}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.5, justifyContent: "flex-end" }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: isSettled ? "var(--color-success)" : "var(--color-warning)",
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: isSettled ? "var(--color-success)" : "var(--color-warning)",
                          }}
                        >
                          {isSettled ? "Settled" : "Pending"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {showPayButton && (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Send size={16} strokeWidth={2} />}
                      sx={{
                        bgcolor: "var(--color-accent)",
                        color: "var(--color-accent-contrast)",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "var(--color-accent)", opacity: 0.9 },
                      }}
                    >
                      Send Payment
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
