import { Observable, tap } from "rxjs"
import { tapWithIndex } from "./tapWithIndex"

export const logObs = (label: string, shouldLog: boolean = true) => <T>(
  valueObs: Observable<T>
) => {
  return valueObs.pipe(
    tapWithIndex((value, i) => {
      shouldLog && console.log(label, i, value)
    })
  )
}
