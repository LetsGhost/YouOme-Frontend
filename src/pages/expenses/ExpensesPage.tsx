import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  Avatar,
} from "@mui/material";

export function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  // Mock data
  const expenses = [
    {
      id: "1",
      description: "Pizza dinner",
      amount: "€ 45.00",
      group: "Dinner Nights",
      paidBy: "You",
      date: "Today",
      status: "settled",
    },
    {
      id: "2",
      description: "Gas & tolls",
      amount: "€ 82.50",
      group: "Weekend Trip",
      paidBy: "John",
      date: "Yesterday",
      status: "pending",
    },
    {
      id: "3",
      description: "Groceries",
      amount: "€ 156.75",
      group: "Apartment Expenses",
      paidBy: "Sarah",
      date: "2 days ago",
      status: "pending",
    },
  ];

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: "#4f46e5" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Expenses
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Add and track shared expenses
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#4f46e5",
            color: "white",
            p: 1.5,
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#4338ca",
            },
          }}
        >
          New Expense
        </Button>
      </Box>

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
            },
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ mr: 1 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All expenses</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Expenses List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#eef2ff",
                      color: "#4f46e5",
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {expense.description}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={expense.group}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem" }}
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Paid by {expense.paidBy}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {expense.amount}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: expense.status === "settled" ? "#22c55e" : "#f59e0b",
                    }}
                  >
                    {expense.status === "settled" ? "✓ Settled" : "⏳ Pending"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}