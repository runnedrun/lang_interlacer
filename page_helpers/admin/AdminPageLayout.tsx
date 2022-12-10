import { BackButton, UrlObject } from "@/components/controls/BackButton"
import { Box } from "@mui/system"
import Head from "next/head"
import React from "react"

export const AdminPageLayout = ({
  title,
  backUrl,
  children,
}: React.PropsWithChildren<{
  title: string
  backUrl?: string | UrlObject
}>) => {
  const view = (
    <div className={"ml flex h-full w-full justify-center"}>
      <div className={"w-full"}>
        <div className="hylite-gradient p-5">
          <div className="text-3xl text-white">{title}</div>
          {backUrl && (
            <Box className="mt-3">
              <BackButton href={backUrl} />
            </Box>
          )}
        </div>
        {children}
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={`${title} Admin panel`} />
        <link rel="icon" href="/hylite_favicon.png" />
      </Head>
      <main className="h-full">{view}</main>
    </>
  )
}
