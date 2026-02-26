import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#00A8A8",
    },
    background: {
      default: "#F7F8FD",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: `"Ubuntu", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  },
});

export default muiTheme;
