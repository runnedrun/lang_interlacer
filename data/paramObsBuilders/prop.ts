import { SingleArgObject } from "@/helpers/SingleArgObject"
import { map } from "rxjs"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { PropArg, propSpecialArg } from "./propSpecialArg"
import { settable } from "./settable"

export const prop = <
  ValueType extends any,
  NameType extends string,
  Optional extends boolean = false
>(
  name: NameType,
  defaultValue?: ValueType,
  optional?: Optional
) => {
  return settable(name, propSpecialArg(name, defaultValue, optional)).pipe(
    map((_) => _._value)
  )
}
