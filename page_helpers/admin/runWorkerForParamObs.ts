// import * as md5 from "js-md5"
import { hydrateFirebaseTimestamps } from "@/helpers/hydrateFirebaseTimestamps"
import { DoWorkUnit, runWorker } from "observable-webworker"
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs"
import { map } from "rxjs/operators"

export type ParamObsWorkerInput<
  InputType extends any,
  ExtraInputsType extends any
> = {
  cache: any
  value: InputType
  extraInputs: ExtraInputsType
}

export type ParamObsWorkerOutput<OutputType extends any> = {
  cache: any
  result: OutputType
}

type OutputFromOutputBundleType<
  OutputBundleType
> = OutputBundleType extends ParamObsWorkerOutput<infer OutputType>
  ? OutputType
  : never

export const runWorkerForParamObs = <
  InputBundleType extends ParamObsWorkerInput<any, any>,
  OutputBundleType extends ParamObsWorkerOutput<any>
>(
  process: (
    inputs: InputBundleType
  ) => Observable<OutputFromOutputBundleType<OutputBundleType>>
) => {
  class Worker implements DoWorkUnit<InputBundleType, OutputBundleType> {
    public workUnit(thisData: InputBundleType): Observable<OutputBundleType> {
      const timestampHydratedCache = hydrateFirebaseTimestamps(thisData.cache)

      const outputObs = process({
        ...thisData,
        cache: timestampHydratedCache,
      })

      return outputObs.pipe(
        map((result) => {
          return { result: result, cache: timestampHydratedCache }
        })
      ) as Observable<OutputBundleType>
    }
  }
  runWorker(Worker)
}
