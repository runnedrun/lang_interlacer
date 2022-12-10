import {
  filter,
  ignoreElements,
  map,
  Observable,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs"
import { emptyObs } from "./emptyObs"

export function mountOnceAndIgnore<T>(
  obsToMount: Observable<any>,
  mountAbove?: boolean
) {
  return (source: Observable<T>): Observable<T> => {
    const k = emptyObs()

    const filtersForIgnoringElements = mountAbove
      ? [
          map((v, i) => [v, i]),
          filter(([_, i]) => {
            return i < 1
          }),
        ]
      : [ignoreElements(), startWith(null)]

    const i = k.pipe(
      switchMap(() => {
        return obsToMount.pipe(...(filtersForIgnoringElements as []))
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      switchMap(() => {
        return source
      })
    )

    return i
  }
}
