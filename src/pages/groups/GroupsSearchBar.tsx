import { Search } from "lucide-react";
import { InputAdornment, TextField } from "@mui/material";

export function GroupsSearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TextField
      fullWidth
      placeholder="Search groups…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} strokeWidth={2} color="var(--color-muted)" />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "var(--radius-sm)",
          bgcolor: "var(--color-surface-2)",
          "& fieldset": {
            borderColor: "var(--color-border)",
          },
        },
      }}
    />
  );
}
