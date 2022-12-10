import { ServerValueNames } from "@/views/view_builder/buildPrefetchHandler"
import { filter, of } from "rxjs"
import { buildParamaterizedObs } from "../builders/buildParamterizedObs"

export const serverValue = (serverValueName: ServerValueNames) =>
  buildParamaterizedObs(serverValueName, {}, (obs) => {
    return of(null).pipe(filter((_) => false))
  }).cloneWithCaching()
