import { map, Observable } from "rxjs"

let counter = 0
export const withGlobalCounter = <T>(obs: Observable<T>) => {
  return obs.pipe(
    map((value) => {
      counter++
      return [counter, value] as const
    })
  )
}
