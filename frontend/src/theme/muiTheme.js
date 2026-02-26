import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#eb7e25d6",
    },
    secondary: {
      main: "#00A8A8",
    },
    background: {
      default: "#01030cff",
      paper: "#0c0101ff",
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
