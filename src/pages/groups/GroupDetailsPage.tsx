import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
} from "@mui/material";

export function GroupDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: "",
    paidBy: "you",
    description: "",
  });

  // Mock data - will be replaced with real API data
  const group = {
    id,
    name: "Apartment Expenses",
    description: "Shared apartment costs for 2024",
    members: [
      { id: "1", name: "You", email: "you@example.com", avatar: "Y" },
      { id: "2", name: "Sarah", email: "sarah@example.com", avatar: "S" },
      { id: "3", name: "Emma", email: "emma@example.com", avatar: "E" },
    ],
  };

  const debts = [
    { id: "1", from: "You", to: "Sarah", amount: "€ 150.00" },
    { id: "2", from: "Emma", to: "You", amount: "€ 75.50" },
    { id: "3", from: "You", to: "Emma", amount: "€ 45.00" },
  ];

  const debtHistory = [
    {
      id: "1",
      date: "2024-03-15",
      type: "expense",
      description: "Monthly rent - Sarah paid",
      amount: "€ 1,500.00",
      participants: ["You", "Sarah", "Emma"],
    },
    {
      id: "2",
      date: "2024-03-10",
      type: "expense",
      description: "Groceries - Emma paid",
      amount: "€ 125.30",
      participants: ["You", "Sarah", "Emma"],
    },
    {
      id: "3",
      date: "2024-03-05",
      type: "settlement",
      description: "Sarah paid You",
      amount: "€ 200.00",
      participants: ["Sarah", "You"],
    },
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create expense
    setShowExpenseDialog(false);
    setExpenseData({ title: "", amount: "", paidBy: "you", description: "" });
  };

  const youOwe = debts
    .filter((d) => d.from === "You")
    .reduce((sum, d) => sum + parseFloat(d.amount.replace("€ ", "").replace(",", ".")), 0);

  const owedToYou = debts
    .filter((d) => d.to === "You")
    .reduce((sum, d) => sum + parseFloat(d.amount.replace("€ ", "").replace(",", ".")), 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header with Back Button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <IconButton onClick={() => navigate("/groups")} sx={{ color: "text.secondary" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {group.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {group.description}
          </Typography>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: "bold", display: "block", mb: 0.5 }}>
              You Owe
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#991b1b" }}>
              € {youOwe.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#166534", fontWeight: "bold", display: "block", mb: 0.5 }}>
              Owed to You
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#166534" }}>
              € {owedToYou.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: "#312e81", fontWeight: "bold", display: "block", mb: 0.5 }}>
              Members
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#312e81" }}>
              {group.members.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowExpenseDialog(true)}
        fullWidth
        sx={{
          bgcolor: "#4f46e5",
          color: "white",
          p: 1.5,
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            bgcolor: "#4338ca",
          },
        }}
      >
        Add Expense
      </Button>

      {/* Members Section */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PeopleIcon sx={{ color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Members
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {group.members.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Avatar sx={{ bgcolor: "#4f46e5", color: "white", fontWeight: "bold" }}>
                  {member.avatar}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {member.email}
                  </Typography>
                </Box>
                {member.id === "1" && (
                  <Chip label="You" size="small" sx={{ bgcolor: "#e0e7ff", color: "#4f46e5" }} />
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Current Debts */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TrendingUpIcon sx={{ color: "#4f46e5" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Current Debts
            </Typography>
          </Box>

          {debts.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {debts.map((debt) => (
                <Box
                  key={debt.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {debt.from}
                      <span style={{ color: "text.secondary", fontWeight: "normal" }}> owes </span>
                      {debt.to}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: debt.from === "You" ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {debt.amount}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              No active debts
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Debt History */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Debt History
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {debtHistory.map((entry, idx) => (
              <Box key={entry.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: entry.type === "settlement" ? "#f0fdf4" : "#eff6ff",
                    border: entry.type === "settlement" ? "1px solid #dcfce7" : "1px solid #e0e7ff",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {entry.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {entry.participants.map((participant) => (
                        <Chip
                          key={participant}
                          label={participant}
                          size="small"
                          sx={{
                            bgcolor: "transparent",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: entry.type === "settlement" ? "#16a34a" : "#4f46e5",
                      ml: 2,
                    }}
                  >
                    {entry.amount}
                  </Typography>
                </Box>
                {idx < debtHistory.length - 1 && <Divider sx={{ my: 0 }} />}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onClose={() => setShowExpenseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>Add Expense</DialogTitle>
        <form onSubmit={handleCreateExpense}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            <TextField
              label="Expense Title"
              fullWidth
              placeholder="e.g., Groceries, Rent"
              value={expenseData.title}
              onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
              required
            />
            <TextField
              label="Amount"
              fullWidth
              type="number"
              placeholder="0.00"
              slotProps={{ input: { step: "0.01", min: "0" } }}
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              required
            />
            <TextField
              label="Paid By"
              select
              fullWidth
              value={expenseData.paidBy}
              onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
              variant="outlined"
            >
              <option value="you">You</option>
              {group.members.filter((m) => m.id !== "1").map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </TextField>
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              placeholder="Add notes..."
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#4f46e5" }}>
              Add Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
