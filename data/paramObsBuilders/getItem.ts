import { map } from "rxjs"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { combine } from "./combine"
import {
  ArgsTypeFromParamObs,
  RecordParamObs,
  ValueTypeFromParamObs,
} from "./ParamObsTypeUtils"
import { settable } from "./settable"

export type ReturnType<
  ParamObsType extends RecordParamObs
> = ParamaterizedObservable<
  ArgsTypeFromParamObs<ParamObsType> & { key: string },
  ValueTypeFromParamObs<ParamObsType>,
  any
>

export const getItem = <ParamObs extends RecordParamObs>(
  recordParamObs: ParamObs,
  log = false
): ReturnType<ParamObs> => {
  return combine(
    {
      recordObs: recordParamObs,
      key: settable("key", undefined as string, true),
    },
    `itemFrom-${recordParamObs.name}`
  ).pipe(
    map(({ recordObs, key }) => {
      return recordObs[key] ?? null
    })
  ) as ReturnType<ParamObs>
}
