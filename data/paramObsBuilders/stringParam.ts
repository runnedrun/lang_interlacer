import { isUndefinedOrNull } from "@/helpers/isUndefinedOrNull"
import { isUndefined } from "lodash"
import { queryParamObs } from "./queryParamObs"
import { readonlyQueryParam } from "./readonlyQueryParam"
import { writableQueryParam } from "./writableQueryParam"

export const stringParam = <Name extends string, ValueType extends string>(
  name: Name,
  defaultValue?: ValueType
) => {
  return queryParamObs(
    name,
    typeof defaultValue === "undefined" ? null : defaultValue,
    (value) => {
      return (isUndefinedOrNull(value) ? value : String(value)) as ValueType
    }
  )
}

export const writableStringParam = <
  Name extends string,
  ValueType extends string
>(
  name: Name,
  defaultValue?: ValueType
) => {
  return writableQueryParam<ValueType, Name>(
    name,
    typeof defaultValue === "undefined" ? null : defaultValue,
    (value) => (isUndefinedOrNull(value) ? value : String(value)) as ValueType
  )
}
