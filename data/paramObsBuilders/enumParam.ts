import { isUndefined } from "lodash"
import { ValuesType } from "utility-types"
import { queryParamObs } from "./queryParamObs"
import { readonlyQueryParam } from "./readonlyQueryParam"
import { writableQueryParam } from "./writableQueryParam"

const getNumberParam = (paramString: any) => {
  return isNaN(Number(paramString)) ? null : Number(paramString)
}

export const enumParam = <Name extends string, EnumType extends Object>(
  name: Name,
  enumType: EnumType,
  defaultKey?: keyof EnumType
) => {
  return queryParamObs<ValuesType<EnumType>, Name>(
    name,
    isUndefined(defaultKey)
      ? null
      : (getNumberParam(enumType[defaultKey]) as ValuesType<EnumType>),
    (value) => getNumberParam(enumType[enumType[value]]) as ValuesType<EnumType>
  )
}

export const writableEnumParam = <Name extends string, EnumType extends Object>(
  name: Name,
  enumType: EnumType,
  defaultKey?: keyof EnumType
) => {
  return writableQueryParam<ValuesType<EnumType>, Name>(
    name,
    isUndefined(defaultKey)
      ? null
      : (getNumberParam(enumType[defaultKey]) as ValuesType<EnumType>),
    (value) => getNumberParam(enumType[enumType[value]]) as ValuesType<EnumType>
  )
}
