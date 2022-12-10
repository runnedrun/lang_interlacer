import { createTheme, responsiveFontSizes } from "@mui/material"
import colors from "tailwindcss/colors"
import { globalStyleOverrides } from "../utils/globalStyleOverrides"

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: globalStyleOverrides,
    },
    MuiTextField: {
      defaultProps: {
        inputProps: {
          className: "p-4",
        },
      },
    },
  },
  palette: {
    primary: {
      main: colors.teal[400],
      contrastText: colors.white,
    },
    secondary: {
      main: colors.green[400],
      contrastText: colors.white,
    },
    info: {
      main: colors.white,
    },
    error: {
      main: colors.rose[400],
      contrastText: colors.white,
    },
  },
})

export default responsiveFontSizes(theme)
