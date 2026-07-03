import { createTheme } from "@mui/material/styles";
import type { ThemeMode } from "../app/ThemeModeContext";

/**
 * MUI needs literal (non-`oklch()`/`var()`) colors because internal helpers
 * like `alpha()`/`darken()` parse the string. These hex values are chosen to
 * closely match the OKLCH design tokens in `styles.css`, which remain the
 * source of truth for anything styled with `sx`/`var(--color-*)` directly.
 */
const palettes = {
  light: {
    mode: "light" as const,
    background: { default: "#f6f7fb", paper: "#ffffff" },
    divider: "#e4e6ec",
    text: { primary: "#1f2333", secondary: "#5a5f72" },
  },
  dark: {
    mode: "dark" as const,
    background: { default: "#14161f", paper: "#1c1e2a" },
    divider: "#2c2f3d",
    text: { primary: "#ececf2", secondary: "#9a9eb0" },
  },
};

export function buildTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      ...palettes[mode],
      primary: {
        main: "#6366f1",
        light: "#818cf8",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
      error: {
        main: "#ef4444",
        light: "#f87171",
        dark: "#dc2626",
      },
      warning: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      info: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#1d4ed8",
      },
      success: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
    },
    typography: {
      fontFamily: 'var(--font-sans, "IBM Plex Sans"), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.1rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "var(--color-bg)",
            color: "var(--color-ink)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            padding: "0.75rem 1.5rem",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: "var(--color-surface)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--color-surface)",
            backgroundImage: "none",
          },
        },
      },
    },
  });
}
