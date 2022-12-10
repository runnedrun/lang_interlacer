import { forOwn, isPlainObject } from "lodash"

export const DeleteField = "__delete__"

export const deepMapObj = (
  obj: any,
  mapper: (value: any, pathMap: string) => any,
  keyPrefix = ""
) => {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  const objIsArray = typeof obj.length !== "undefined"

  const newObj = objIsArray ? [] : {}

  forOwn(obj, function (value, key) {
    const valueIsArray = typeof value?.length !== "undefined"
    const path = `${keyPrefix}${key}`
    const newValue = mapper(value, path)
    if (typeof newValue !== "undefined") {
      if (newValue !== DeleteField) {
        newObj[key] = newValue
        return
      }
    } else if (isPlainObject(value) || valueIsArray) {
      newObj[key] = deepMapObj(value, mapper, `${path}.`)
    } else {
      newObj[key] = value
    }
  })

  return newObj
}
