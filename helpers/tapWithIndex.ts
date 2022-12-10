import { map, Observable, tap } from "rxjs"

export const tapWithIndex = <T>(callback: (v: T, i: number) => void) => {
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      map((v, i) => [v, i] as const),
      tap(([v, i]) => callback(v, i)),
      map(([v]) => v)
    )
  }
}
