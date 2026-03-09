import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ea580c",
      dark: "#c2440f",
      light: "#fff4ef",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#374151",
    },
  },
  typography: {
    fontFamily: `"Ubuntu", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    allVariants: {
      color: "var(--color-text-primary)",
    },
  },
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-subtle)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "var(--color-text-primary)",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "var(--color-text-primary)",
        },
      },
    },
  },
});

export default muiTheme;