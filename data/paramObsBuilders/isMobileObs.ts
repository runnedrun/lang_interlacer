import { isServerside } from "@/helpers/isServerside"
import { ServerValueNames } from "@/views/view_builder/buildPrefetchHandler"
import { defer, filter, of } from "rxjs"
import { buildParamaterizedObs } from "../builders/buildParamterizedObs"
import { isMobile } from "react-device-detect"

export const isMobileObs = () =>
  buildParamaterizedObs("isMobile", {}, () => {
    return defer(() => {
      return isServerside() ? of(null).pipe(filter((_) => false)) : of(isMobile)
    })
  }).cloneWithCaching()
