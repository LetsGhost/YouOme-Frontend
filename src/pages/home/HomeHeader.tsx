import { Box, Typography } from "@mui/material";

import { microLabelSx } from "./homeStyles";

export function HomeHeader({ name }: { name: string }) {
  return (
    <Box
      sx={{
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 2.75, md: 3.25 },
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography sx={{ ...microLabelSx, mb: 0.5 }}>Welcome back</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.4rem", md: "1.6rem" }, color: "var(--color-ink)" }}>
          {name}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "var(--radius-sm)",
          display: "grid",
          placeItems: "center",
          bgcolor: "var(--color-accent-soft-bg)",
          color: "var(--color-accent-soft-ink)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "1.1rem",
        }}
      >
        {name[0].toUpperCase()}
      </Box>
    </Box>
  );
}
