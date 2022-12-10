import { hydrateFirebaseTimestamps } from "@/helpers/hydrateFirebaseTimestamps"
import { isServerside } from "@/helpers/isServerside"
import { isUndefined } from "lodash"
import { fromWorkerPool } from "observable-webworker"
import { combineLatest, filter, map, of, switchMap } from "rxjs"
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

let returnSynchronously = true
if (!isServerside()) {
  setTimeout(() => {
    returnSynchronously = false
  }, 3000)
}

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
  const returnSyncOrWithWorker = (
    values: ValueTypeFromParamObs<ParamObsType>
  ) => {
    if (returnSynchronously) {
      return values.length
        ? combineLatest(
            values.map((value) =>
              hydrateObj(value, paramObs.cacheBehaviorSubject)(hydrationPathMap)
            )
          )
        : of([])
    } else {
      return fromWorkerPool<
        HydrationWorkerInputType,
        HydrationWorkerOutputType
      >(
        () => new Worker(new URL("./hydration.worker.ts", import.meta.url)),
        of({
          value: values,
          extraInputs: { hydrationMap: hydrationPathMap },
          cache: paramObs.cacheBehaviorSubject.getValue(),
        })
      ).pipe(
        map(({ result, cache }) => {
          Object.assign(
            paramObs.cacheBehaviorSubject.getValue(),
            hydrateFirebaseTimestamps(cache)
          )
          return hydrateFirebaseTimestamps(result)
        })
      )
    }
  }

  return paramObs.pipe(
    filter((_) => !isUndefined(_)),
    switchMap(returnSyncOrWithWorker)
  ) as ReturnType<ParamObsType, PathMapToHydrate>
}
