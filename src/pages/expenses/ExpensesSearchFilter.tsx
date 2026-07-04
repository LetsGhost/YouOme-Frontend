import { Filter, Search } from "lucide-react";
import { Box, FormControl, InputAdornment, MenuItem, Select, TextField } from "@mui/material";

import { outlinedFieldSx } from "./expensesStyles";

export type ExpenseFilter = "all" | "paid" | "pending";

export function ExpensesSearchFilter({
  searchTerm,
  onSearchTermChange,
  filter,
  onFilterChange,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filter: ExpenseFilter;
  onFilterChange: (value: ExpenseFilter) => void;
}) {
  return (
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
        onChange={(e) => onSearchTermChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="var(--color-muted)" strokeWidth={1.8} />
              </InputAdornment>
            ),
          },
        }}
        sx={outlinedFieldSx}
      />
      <FormControl sx={{ minWidth: 170 }}>
        <Select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as ExpenseFilter)}
          startAdornment={
            <InputAdornment position="start">
              <Filter size={16} color="var(--color-muted)" strokeWidth={1.8} style={{ marginRight: 8 }} />
            </InputAdornment>
          }
          sx={{
            bgcolor: "var(--color-surface)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-strong)" },
          }}
        >
          <MenuItem value="all">All expenses</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
