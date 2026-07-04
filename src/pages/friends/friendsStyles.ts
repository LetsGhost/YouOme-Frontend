export const microLabelSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "var(--color-muted)",
};

export const outlinedFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "var(--color-surface)",
    "& fieldset": { borderColor: "var(--color-border)" },
    "&:hover fieldset": { borderColor: "var(--color-border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-accent)" },
  },
};
