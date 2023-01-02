import { GetServerSidePropsContext } from "next"
import absoluteUrl from "next-absolute-url"

interface Props {
  ctx: GetServerSidePropsContext<any>
}
export const redirectToQueryDestination = ({ ctx }: Props) => {
  const isServerSide = typeof window === "undefined"
  const origin = isServerSide
    ? absoluteUrl(ctx.req).origin
    : window.location.origin

  const params = isServerSide
    ? new URL(ctx.req.url, origin).searchParams
    : new URLSearchParams(window.location.search)

  const destinationParamVal = params.get("destination")
    ? decodeURIComponent(params.get("destination"))
    : undefined

  let destURL = "/"
  if (destinationParamVal) {
    destURL = destinationParamVal
  }

  return destURL
}
