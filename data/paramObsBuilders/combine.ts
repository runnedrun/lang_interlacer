import { objKeys } from "@/helpers/objKeys"
import { UnionToIntersection } from "utility-types"
import { buildParamaterizedObs } from "../builders/buildParamterizedObs"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { attachObs } from "./attachObs"
import {
  ParamObsMap,
  UnionOfArgs,
  ValuesMapFromParamObsMap,
} from "./ParamObsTypeUtils"

export type CombinedParamObs<Map extends ParamObsMap> = ParamaterizedObservable<
  UnionToIntersection<UnionOfArgs<Map>>,
  ValuesMapFromParamObsMap<Map>,
  any
>

export const combine = <InputMap extends ParamObsMap>(
  obsToCombine: InputMap,
  name = "",
  log = false
): CombinedParamObs<InputMap> => {
  const values = {} as ValuesMapFromParamObsMap<InputMap>
  objKeys(obsToCombine).forEach((key) => {
    values[key] = undefined
  })

  const unattachedCombinedObs = buildParamaterizedObs(
    name,
    values,
    (argsObs) => argsObs,
    undefined,
    log
  )

  return attachObs(
    unattachedCombinedObs,
    obsToCombine,
    log
  ) as CombinedParamObs<InputMap>
}
