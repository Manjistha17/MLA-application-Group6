import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#fa632a",
      dark: "#e0521a",
      light: "#fde8df",
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
  },
});

export default muiTheme;