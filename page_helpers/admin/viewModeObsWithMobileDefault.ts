import { combine } from "@/data/paramObsBuilders/combine"
import { enumParam } from "@/data/paramObsBuilders/enumParam"
import { isMobileObs } from "@/data/paramObsBuilders/isMobileObs"
import { isNull } from "lodash"
import { map } from "rxjs"
import { ViewType } from "./buildDataViewFromFieldDisplays"

export const viewModeObsWithMobileDefault = (renderId?: string) =>
  combine({
    viewMode: enumParam("viewMode", ViewType),
    isMobile: isMobileObs(),
  }).pipe(
    map(({ viewMode, isMobile }) => {
      if (isNull(viewMode)) {
        if (isMobile) {
          return ViewType.Panel
        } else {
          return ViewType["Data Grid"]
        }
      }
      return viewMode
    })
  )
