import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    // type: "light",
    primary: {
      main: "#333357"
    },
    secondary: {
      main: "#04afff"
    },
    error: {
      main: "#ff1744"
    },
    background: {
      default: "#fff",
    },
    grey: {
      100: '#f4f6f9',
      900: '#98999b'
    }
  },
  spacing: 4,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
