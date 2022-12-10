import { defer, Observable } from "rxjs"

export function startWithTap<T>(callback: () => void) {
  return (source: Observable<T>) =>
    defer(() => {
      callback()
      return source
    })
}
