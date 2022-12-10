import { Observable } from "rxjs"

export const emptyObs = () => {
  return new Observable((obs) => {
    obs.next()
  })
}
