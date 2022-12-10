import { queryParamObs } from "./queryParamObs"
import { writableSpecialArg } from "./writableSpecialArg"

export const writableQueryParam = <
  ValueType extends any,
  NameType extends string
>(
  name: NameType,
  defaultValue: ValueType,
  processQueryValue: (query: string) => ValueType
) => queryParamObs(name, defaultValue, processQueryValue)
