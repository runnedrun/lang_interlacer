import { SingleArgObject } from "@/helpers/SingleArgObject"
import { map } from "rxjs"
import { AnyGenericModel } from "../baseTypes/Model"
import { obsUidMap } from "../firebaseObsBuilders/obsUidMap"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { item } from "../paramObsBuilders/item"
import { ValueTypeFromArrayParamObs } from "../paramObsBuilders/ParamObsTypeUtils"
import { prop } from "../paramObsBuilders/prop"
import { PropArg } from "../paramObsBuilders/propSpecialArg"

export const getItemFromModelList = <
  ParamObsType extends ParamaterizedObservable<
    Record<any, any>,
    AnyGenericModel[],
    any
  >,
  PropName extends string
>(
  data: ParamObsType,
  propKey: PropName,
  log = false
): ParamaterizedObservable<
  SingleArgObject<PropName, PropArg<string>>,
  ValueTypeFromArrayParamObs<ParamObsType>,
  any
> => {
  const dataItem = obsUidMap(data)

  return item(dataItem, prop(propKey, undefined as any), log).pipe(
    map((_) => _ ?? undefined)
  ) as any
}
