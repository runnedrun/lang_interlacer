import { TailwindCssBaseline } from "./TailwindCSSBaseline"

export const globalStyleOverrides = `
  ${TailwindCssBaseline}

  img {
    display: inline-block;
  }
  body {
    -webkit-font-smoothing: auto;
  },
`
