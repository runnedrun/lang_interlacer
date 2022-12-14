import { hydrateFirebaseTimestamps } from "@/helpers/hydrateFirebaseTimestamps"
import { isServerside } from "@/helpers/isServerside"
import { useWorkerForParamObs } from "@/page_helpers/admin/useWorkerForParamObs"
import { isUndefined } from "lodash"
import { fromWorkerPool } from "observable-webworker"
import { combineLatest, filter, map, Observable, of, switchMap } from "rxjs"
import { PathMapToCollectionName } from "../baseTypes/ForeignKey"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  ValueTypeFromArrayParamObs,
  ValueTypeFromParamObs,
} from "../paramObsBuilders/ParamObsTypeUtils"
import { GetHydratedValue, hydrateObj } from "./hydrate"
import {
  HydrationWorkerInputType,
  HydrationWorkerOutputType,
} from "./hydration.worker"

type ReturnType<
  ParamObs extends ParamaterizedObservable<any, Record<string, any>[], any>,
  PathMapToHydrate extends Partial<
    PathMapToCollectionName<ValueTypeFromArrayParamObs<ParamObs>>
  >
> = ParamaterizedObservable<
  ArgsTypeFromParamObs<ParamObs>,
  GetHydratedValue<ValueTypeFromArrayParamObs<ParamObs>, PathMapToHydrate>[],
  any
>

export const hydrateArray = <
  ParamObsType extends ParamaterizedObservable<any, Record<string, any>[], any>
>(
  paramObs: ParamObsType
) => <
  PathMapToHydrate extends Partial<
    PathMapToCollectionName<ValueTypeFromArrayParamObs<ParamObsType>>
  >
>(
  hydrationPathMap: PathMapToHydrate
): ReturnType<ParamObsType, PathMapToHydrate> => {
  const filteredObs = paramObs.pipe(filter((_) => !isUndefined(_)))

  return useWorkerForParamObs<
    ParamaterizedObservable<any, any, any>,
    HydrationWorkerInputType,
    HydrationWorkerOutputType
  >(
    filteredObs,
    () => new Worker(new URL("./hydration.worker.ts", import.meta.url)),
    { hydrationMap: hydrationPathMap },
    (values) => {
      return values.length
        ? (combineLatest(
            values.map((value) =>
              hydrateObj(value, paramObs.cacheBehaviorSubject)(hydrationPathMap)
            )
          ) as Observable<any[]>)
        : of([] as any[])
    }
  ) as ReturnType<ParamObsType, PathMapToHydrate>
}
