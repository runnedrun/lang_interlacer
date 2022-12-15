import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  NameTypeFromParamObs,
  ValueTypeFromParamObs,
} from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { hydrateFirebaseTimestamps } from "@/helpers/hydrateFirebaseTimestamps"
import { isServerside } from "@/helpers/isServerside"
import { fromWorkerPool } from "observable-webworker"
import { map, Observable, of, switchMap } from "rxjs"
import {
  ParamObsWorkerInput,
  ParamObsWorkerOutput,
} from "./runWorkerForParamObs"

let returnSynchronously = true
if (!isServerside()) {
  setTimeout(() => {
    returnSynchronously = false
  }, 3000)
}

type GetWorkerOuput<
  WorkerOutputType extends ParamObsWorkerOutput<any>
> = WorkerOutputType extends ParamObsWorkerOutput<infer T> ? T : never

type GetWorkerInput<
  WorkerInputType extends ParamObsWorkerInput<any, any>
> = WorkerInputType extends ParamObsWorkerInput<infer T, any> ? T : never

type GetWorkerExtraType<
  WorkerInputType extends ParamObsWorkerInput<any, any>
> = WorkerInputType extends ParamObsWorkerInput<any, infer T> ? T : never

export const useWorkerForParamObs = <
  InputObsType extends ParamaterizedObservable<any, any, any>,
  WorkerInputType extends ParamObsWorkerInput<
    ValueTypeFromParamObs<InputObsType>,
    any
  >,
  WorkerOutputType extends ParamObsWorkerOutput<any>
>(
  inputObs: InputObsType,
  workerFn: () => Worker,
  extraValues: GetWorkerExtraType<WorkerInputType>,
  execWithoutWorker?: (
    input: ValueTypeFromParamObs<InputObsType>
  ) => Observable<GetWorkerOuput<WorkerOutputType>>
): ParamaterizedObservable<
  ArgsTypeFromParamObs<InputObsType>,
  GetWorkerOuput<WorkerOutputType>,
  NameTypeFromParamObs<InputObsType>
> => {
  return inputObs.pipe(
    switchMap((value) => {
      if (execWithoutWorker && (returnSynchronously || isServerside())) {
        return execWithoutWorker(value)
      } else {
        return fromWorkerPool<WorkerInputType, WorkerOutputType>(
          workerFn,
          of({
            value: value,
            extraInputs: extraValues,
            cache: inputObs.cacheBehaviorSubject.getValue(),
          } as any)
        ).pipe(
          map(({ result, cache }) => {
            Object.assign(
              inputObs.cacheBehaviorSubject.getValue(),
              hydrateFirebaseTimestamps(cache)
            )
            return hydrateFirebaseTimestamps(result)
          })
        )
      }
    })
  )
}
