import { queryParamObs } from "./queryParamObs"

export const readonlyQueryParam = <
  ValueType extends any,
  NameType extends string
>(
  name: NameType,
  defaultValue: ValueType,
  processQueryValue: (query: string) => ValueType
) => queryParamObs(name, defaultValue, processQueryValue)
