import { createTheme } from "@mui/material/styles";

export function buildTheme(mode: "light" | "dark") {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? "#4f46e5" : "#6366f1", // Indigo
        light: isLight ? "#818cf8" : "#a5b4fc",
        dark: isLight ? "#3730a3" : "#4338ca",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isLight ? "#0ea5e9" : "#38bdf8", // Sky blue
        light: isLight ? "#38bdf8" : "#7dd3fc",
        dark: isLight ? "#0369a1" : "#0284c7",
        contrastText: "#ffffff",
      },
      error: {
        main: isLight ? "#dc2626" : "#f87171",
        light: "#fca5a5",
        dark: "#991b1b",
      },
      warning: {
        main: isLight ? "#ea580c" : "#fb923c",
        light: "#fde047",
        dark: "#9a3412",
      },
      success: {
        main: isLight ? "#16a34a" : "#4ade80",
        light: "#86efac",
        dark: "#166534",
      },
      background: {
        default: isLight ? "#f8fafc" : "#0f172a", // Slate 50 / Slate 900
        paper: isLight ? "#ffffff" : "#1e293b", // White / Slate 800
      },
      text: {
        primary: isLight ? "#0f172a" : "#f1f5f9",
        secondary: isLight ? "#475569" : "#94a3b8",
      },
      divider: isLight ? "#e2e8f0" : "#334155",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: ["Inter", '"SF Pro Display"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"].join(","),
      h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.025em" },
      h2: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.015em" },
      h4: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
      h5: { fontSize: "1rem", fontWeight: 600 },
      h6: { fontSize: "0.875rem", fontWeight: 600 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.5 },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: "8px",
            padding: "8px 16px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          containedPrimary: {
            background: isLight 
              ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)" 
              : "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
            "&:hover": {
              background: isLight 
                ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" 
                : "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
            },
          },
          containedSecondary: {
            background: isLight 
              ? "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)" 
              : "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
            "&:hover": {
              background: isLight 
                ? "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)" 
                : "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
            boxShadow: isLight 
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)" 
              : "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)",
            backgroundImage: "none",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
            "&:hover": {
              boxShadow: isLight
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
              borderColor: isLight ? "#cbd5e1" : "#475569",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          elevation1: {
            boxShadow: isLight 
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)" 
              : "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.8)",
            color: isLight ? "#0f172a" : "#f1f5f9",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
            boxShadow: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? "#ffffff" : "#0f172a",
            borderRight: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? "#f8fafc" : "#1e293b",
            "& th": {
              fontWeight: 600,
              color: isLight ? "#475569" : "#94a3b8",
              borderBottom: isLight ? "2px solid #e2e8f0" : "2px solid #334155",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.15s ease",
            "&:hover": {
              backgroundColor: isLight ? "#f1f5f9" : "#1e293b",
            },
            "&.Mui-selected": {
              backgroundColor: isLight ? "#e0e7ff" : "#312e81",
              "&:hover": {
                backgroundColor: isLight ? "#c7d2fe" : "#3730a3",
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
            padding: "12px 16px",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: "2px",
            },
          },
        },
      },
    },
  });
}
