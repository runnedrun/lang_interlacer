import { delayObs } from "@/helpers/delayObs"
import { isUndefined } from "@/helpers/isUndefined"
import { clone, isEqual } from "lodash"
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  pairwise,
  startWith,
  switchMap,
  tap,
} from "rxjs"
import { DataWithLoading } from "../ParamaterizedObservable"

export type Cache<ArgsType extends any> = {
  get: (args: ArgsType) => any
  set: (args: ArgsType, value: any) => void
  cacheSubject: BehaviorSubject<Record<string, any>>
}
export const buildCachingForDataWithLoading = <
  ArgsType extends any,
  DataWithLoadingType extends DataWithLoading<any, ArgsType>
>(
  cache: Cache<ArgsType>,
  argTransformFn?: (args: Partial<ArgsType>) => any,
  alwaysReadFromCache = false
) => (
  inputObs: Observable<DataWithLoadingType>
): Observable<DataWithLoadingType> => {
  return inputObs.pipe(
    startWith({} as DataWithLoadingType),
    pairwise(),
    map(([oldDataWithLoading, dataWithLoading]) => {
      const clonedDataWithLoading = clone(dataWithLoading)
      const args = dataWithLoading.args
      const tranformedArgs = argTransformFn ? argTransformFn(args) : args

      const loadingAndArgsHaveChanged =
        dataWithLoading.isLoading &&
        !isEqual(oldDataWithLoading.args, dataWithLoading.args)

      if (loadingAndArgsHaveChanged || alwaysReadFromCache) {
        const cachedData = cache.get(tranformedArgs)
        if (!isUndefined(cachedData)) {
          Object.assign(clonedDataWithLoading, {
            finalValue: cachedData,
            isLoading: false,
          })
        }
      }

      if (!loadingAndArgsHaveChanged && !alwaysReadFromCache) {
        cache.set(tranformedArgs, dataWithLoading.finalValue)
      }

      return clonedDataWithLoading
    })
  )
}

export const buildCachedSwitchMap = <
  ArgsType extends any,
  ReturnType extends any
>(
  cache: Cache<ArgsType>,
  buildObs: (args: ArgsType) => Observable<ReturnType>,
  argTransformFn?: (args: ArgsType) => any
) => (inputObs: Observable<ArgsType>): Observable<ReturnType> => {
  return inputObs.pipe(
    switchMap((currentArgs) => {
      const tranformedArgs = argTransformFn
        ? argTransformFn(currentArgs)
        : currentArgs
      const cachedData = cache.get(tranformedArgs)

      const cachedDataObs = isUndefined(cachedData) ? of() : of(cachedData)

      const unCachedData = buildObs(currentArgs).pipe(
        tap((value) => {
          cache.set(tranformedArgs, value)
        })
      )
      return merge(cachedDataObs, delayObs(unCachedData, 1)).pipe(
        distinctUntilChanged(isEqual)
      )
    })
  )
}
