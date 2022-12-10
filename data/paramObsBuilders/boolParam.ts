import { map } from "rxjs"
import { queryParamObs } from "./queryParamObs"
import { stringParam } from "./stringParam"

export const readOnlyBoolParam = <NameType extends string>(
  name: NameType,
  defaultValue: boolean
) => {
  return queryParamObs(name, defaultValue, (value) => {
    return value === "true"
  })
}

export const boolParam = <NameType extends string>(
  name: NameType,
  defaultValue: boolean
) => {
  return queryParamObs(name, defaultValue, (valueString: boolean | string) => {
    return valueString === "true" || valueString === true
  })
}
