import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import WarningIcon from "@mui/icons-material/Warning";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Button,
  Chip,
} from "@mui/material";

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#4f46e5" }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Settlements
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Manage payments and settle debts
          </Typography>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                You owe
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ef4444", mb: 0.5 }}>
                € 95.50
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                2 pending payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Owed to you
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22c55e", mb: 0.5 }}>
                € 45.00
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                1 pending payment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Net balance
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4f46e5", mb: 0.5 }}>
                € -50.50
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                You owe €50.50 total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settlements List */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Recent Transactions
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {settlements.map((settlement) => (
            <Card key={settlement.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor:
                          settlement.from === "You" ? "#fee2e2" : "#dcfce7",
                        color: settlement.from === "You" ? "#dc2626" : "#22c55e",
                        flexShrink: 0,
                      }}
                    >
                      {settlement.from === "You" ? <SendIcon /> : <CheckIcon />}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {settlement.from === "You" ? "Pay" : "Receive from"}{" "}
                        <span style={{ color: "#4f46e5" }}>{settlement.to}</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        {settlement.reason}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: settlement.from === "You" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {settlement.from === "You" ? "-" : "+"}
                      {settlement.amount}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, justifyContent: "flex-end" }}>
                      {settlement.status === "pending" ? (
                        <>
                          <WarningIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                          <Typography variant="caption" sx={{ fontWeight: "bold", color: "#f59e0b" }}>
                            Pending
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CheckIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                          <Typography variant="caption" sx={{ fontWeight: "bold", color: "#22c55e" }}>
                            Settled
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                {settlement.status === "pending" && settlement.from === "You" && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SendIcon />}
                    sx={{
                      bgcolor: "#4f46e5",
                      color: "white",
                      mt: 1.5,
                      textTransform: "none",
                      fontWeight: "bold",
                      "&:hover": {
                        bgcolor: "#4338ca",
                      },
                    }}
                  >
                    Send Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}