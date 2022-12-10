import { memoize } from "lodash"

export const memoizeDataFunc = <ReturnType extends any>(
  func: (id: string) => ReturnType
): ((id: string) => ReturnType) =>
  memoize((id) => {
    console.log("running data func again", id)
    return func(id)
  })
