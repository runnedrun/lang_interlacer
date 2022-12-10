import { delay, Observable, switchMap } from "rxjs"
import { emptyObs } from "./emptyObs"

export const delayObs = (obs: Observable<any>, delayTime?: number) => {
  return emptyObs().pipe(
    delay(delayTime),
    switchMap(() => {
      return obs
    })
  )
}
