import red from "@material-ui/core/colors/red";
import { createTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#333357"
    },
    secondary: {
      main: "#04afff"
    },
    error: {
      main: red.A400
    },
    background: {
      default: "#fff",
    },
    grey: {
      100: '#f4f6f9',
      900: '#98999b'
    }
  },
  spacing: 4
});

export default theme;
