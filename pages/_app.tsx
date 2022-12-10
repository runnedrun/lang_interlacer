import initAuth from "@/data/auth/initAuth" // the module you created above
import { init } from "@/data/initFb"
import { isServerside } from "@/helpers/isServerside"
import theme from "@/utils/theme"
import { useQueryObsWithEffect } from "@/views/view_builder/queryObs"
import { RenderIdContext } from "@/views/view_builder/RenderIdContext"
import { CacheProvider, EmotionCache } from "@emotion/react"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { StyledEngineProvider } from "@mui/material/styles"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useMemo } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import createEmotionCache from "utils/createEmotionCache"
import { v4 as uuidv4 } from "uuid"
import "../styles/device.css"
import "../styles/globals.css"

init()
initAuth()

const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: MyAppProps) {
  useQueryObsWithEffect()

  const { locale, query } = useRouter()

  const app = useMemo(() => {
    const uid = uuidv4()
    const component = <Component {...pageProps} />
    return (
      <RenderIdContext.Provider value={uid}>
        <>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            draggable
            pauseOnHover
          />
          {component}
        </>
      </RenderIdContext.Provider>
    )
  }, [locale, query.slug, pageProps])

  if (!isServerside()) {
    const rootElement = window.document.getElementById("__next")
    theme.components = {
      ...theme.components,
      ...{
        MuiPopover: {
          defaultProps: {
            container: rootElement,
          },
        },
        MuiPopper: {
          defaultProps: {
            container: rootElement,
          },
        },
        MuiModal: {
          defaultProps: {
            container: rootElement,
          },
        },
      },
    }
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <StyledEngineProvider injectFirst>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {app}
          </ThemeProvider>
        </CacheProvider>
      </StyledEngineProvider>
    </>
  )
}
export default MyApp
