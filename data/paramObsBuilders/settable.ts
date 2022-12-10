import {
  buildSingleArgObject,
  SingleArgObject,
} from "@/helpers/SingleArgObject"
import { map } from "rxjs"
import { buildParamaterizedObs } from "../builders/buildParamterizedObs"
import { ParamaterizedObservable } from "../ParamaterizedObservable"

export const settable = <ValueType extends any, NameType extends string>(
  name: NameType,
  defaultValue?: ValueType,
  waitForFirstValue = false,
  log = false
): ParamaterizedObservable<
  SingleArgObject<NameType, ValueType>,
  ValueType,
  any
> => {
  const args = buildSingleArgObject(
    name,
    typeof defaultValue === "undefined" && !waitForFirstValue
      ? null
      : defaultValue
  )

  const settableParamObs = buildParamaterizedObs(
    `settable-${name}`,
    args,
    (value) => value.pipe(map((_) => _[name])),
    undefined,
    log
  )

  return settableParamObs
}
