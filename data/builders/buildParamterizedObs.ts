import { ArgsMap } from "@/data/builders/ArgsMap"
import { deepMapObj } from "@/helpers/deepMapObj"
import { filterUndefFromObj, objHasUndef } from "@/helpers/filterUndef"
import { objKeys } from "@/helpers/objKeys"
import { tapWithIndex } from "@/helpers/tapWithIndex"
import {
  clone as lodashClone,
  isEqual,
  isUndefined,
  omit,
  pickBy,
} from "lodash"
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  merge,
  Observable,
  of,
  OperatorFunction,
  pairwise,
  shareReplay,
  startWith,
  tap,
} from "rxjs"
import {
  CacheSpecification,
  DataWithLoading,
  KeyType,
  ParamaterizedObservable,
} from "../ParamaterizedObservable"
import { buildCachingForDataWithLoading, Cache } from "./buildCachedSwitchMap"
import { buildCacheFromCacheSubject } from "./buildCacheFromCacheSubject"
import { combineDataWithLoadingObservables } from "./combineDataWithLoadingObservables"

export const shouldNotSkipArg = <
  DataWithLoadingType extends DataWithLoading<any, any>
>(
  dataWithLoading: DataWithLoadingType
) =>
  !objHasUndef(dataWithLoading.args) &&
  !Object.values(dataWithLoading.args).some((_) => _?._skipArg)

const filterArgsByOriginalArgs = <ArgsType extends ArgsMap>(
  args: Record<string, any>,
  originalArgs: ArgsType
) => {
  return pickBy(args || {}, (_, keyName) => {
    return (
      Object.keys(originalArgs).includes(keyName) || keyName.startsWith("__")
    )
  }) as ArgsType
}

export const buildOriginalArgsFilter = <M, ArgsType extends ArgsMap>(
  originalArgs: ArgsType
) => (currentDataWithLoading: DataWithLoading<M, ArgsType>) => {
  return {
    ...currentDataWithLoading,
    args: filterArgsByOriginalArgs(currentDataWithLoading.args, originalArgs),
  } as DataWithLoading<M, ArgsType>
}

const removeFunctionsFromArgs = <ArgsType extends ArgsMap>(args: ArgsType) => {
  return deepMapObj(args, (_) => (typeof _ === "function" ? null : undefined))
}

const removeFunctionsFromArgsInDataWithLoading = <ArgType extends ArgsMap>(
  dataWithLoading: DataWithLoading<any, ArgType>
) => {
  const argsWithNoFn = removeFunctionsFromArgs(dataWithLoading.args)
  return { ...dataWithLoading, args: argsWithNoFn }
}

type BuildObsFn<M extends any, ArgsType extends Record<string, any>> = (
  observableArgs: Observable<Partial<ArgsType>>,
  cache: Cache<ArgsType>
) => Observable<M>

export type CustomLoadingBuildObsArgs<
  InputValueType,
  M,
  ArgsType extends ArgsMap
> = {
  argsWithLoadingObs: Observable<DataWithLoading<InputValueType, ArgsType>>
  rawDataWithLoadingObs: Observable<DataWithLoading<InputValueType, ArgsType>>
  argsObs: Observable<ArgsType>
  cache: Cache<ArgsType>
}

export type CustomLoadingBuildObsFn<
  InputValueType extends any,
  M extends any,
  ArgsType extends Record<string, any>
> = (
  args: CustomLoadingBuildObsArgs<InputValueType, M, ArgsType>
) => Observable<DataWithLoading<M, ArgsType>>

const argsFromDataWithLoading = <M, ArgsType>(
  obs: Observable<DataWithLoading<M, ArgsType>>
) => obs.pipe(map((_) => _.args))

export const buildLoadingObsBuilder = <
  M extends any,
  ArgType extends Record<string, any>
>(
  buildFinalValueObsFromArgs: BuildObsFn<M, ArgType>,
  log = false
): CustomLoadingBuildObsFn<any, M, ArgType> => ({
  argsWithLoadingObs,
  cache,
  argsObs,
}) => {
  const finalValueWithLoading = buildFinalValueObsFromArgs(argsObs, cache).pipe(
    map(
      (_) =>
        ({
          isLoading: false,
          finalValue: _,
        } as DataWithLoading<M, ArgType>)
    )
  )

  return combineDataWithLoadingObservables([
    argsWithLoadingObs,
    merge(of({} as any), finalValueWithLoading),
  ]).pipe(shareReplay({ refCount: true, bufferSize: 1 })) as Observable<
    DataWithLoading<M, ArgType>
  >
}

export const pipeToFinalValue = <M extends any, ArgsType extends ArgsMap>(
  obs: Observable<DataWithLoading<M, ArgsType>>
) => {
  return obs.pipe(
    filter((_) => !_.isLoading && !isUndefined(_.finalValue)),
    map((_) => {
      return _.finalValue
    })
  )
}

type ArgPropertyFilter<M, ArgsType extends ArgsMap> = (
  args: DataWithLoading<M, ArgsType>
) => DataWithLoading<M, ArgsType>

const buildArgsCleaner = <M, ArgsType extends ArgsMap>(
  argPropertyFilter: ArgPropertyFilter<M, ArgsType>
) => (dataWithLoading: DataWithLoading<M, ArgsType>) => {
  return argPropertyFilter(dataWithLoading)
}

const distinctLoadingDataByArgs = distinctUntilChanged<
  DataWithLoading<any, any>
>((a, b) => {
  const aWithoutFunctions = removeFunctionsFromArgsInDataWithLoading(
    lodashClone(a)
  )
  const bWithoutFunctions = removeFunctionsFromArgsInDataWithLoading(
    lodashClone(b)
  )

  return isEqual(aWithoutFunctions.args, bWithoutFunctions.args)
})

export const applyAllArgFilters = <M, ArgsType extends ArgsMap>(
  argPropertyFilter: ArgPropertyFilter<M, ArgsType>,
  log = false
) => (dataWithLoadingObs: Observable<DataWithLoading<M, ArgsType>>) => {
  return dataWithLoadingObs.pipe(
    map(argPropertyFilter),
    distinctLoadingDataByArgs,
    filter(shouldNotSkipArg)
  )
}

const argFilterForLoadingObs = (obs: Observable<DataWithLoading<any, any>>) =>
  obs.pipe(
    startWith(undefined as DataWithLoading<any, any>),
    pairwise(),
    map(([a, b]) => {
      if (!a) {
        return { ...b, isLoading: true }
      }
      const aWithoutFunctions = removeFunctionsFromArgsInDataWithLoading(
        lodashClone(a)
      )
      const bWithoutFunctions = removeFunctionsFromArgsInDataWithLoading(
        lodashClone(b)
      )

      if (
        a.isLoading !== b.isLoading &&
        isEqual(aWithoutFunctions.args, bWithoutFunctions.args)
      ) {
        return b
      } else if (!isEqual(aWithoutFunctions.args, bWithoutFunctions.args)) {
        return { ...b, isLoading: true }
      } else {
        return undefined
      }
    }),
    filter((valueOrUndefined) => {
      return !isUndefined(valueOrUndefined)
    }),
    filter((v, i) => {
      return i == 0 ? true : shouldNotSkipArg(v)
    })
  )

export const buildArgsForObsBuilder = <M, ArgsType extends ArgsMap>(
  dataWithLoadingObs: Observable<DataWithLoading<M, ArgsType>>,
  argPropertyFilter: ArgPropertyFilter<M, ArgsType>,
  cache: Cache<ArgsType>,
  log = false
): CustomLoadingBuildObsArgs<any, M, ArgsType> => {
  const rawDataWithLoadingObs = dataWithLoadingObs.pipe(
    map((dataWithLoading) => {
      const skipToUndefArgs = {} as ArgsType
      objKeys(dataWithLoading.args).forEach((key) => {
        skipToUndefArgs[key] = dataWithLoading.args[key]?._skipArg
          ? undefined
          : dataWithLoading.args[key]
      })
      dataWithLoading.args = skipToUndefArgs
      return dataWithLoading
    }),
    map(argPropertyFilter),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  const argsFilteredObs = rawDataWithLoadingObs.pipe(
    argFilterForLoadingObs,
    shareReplay({ bufferSize: 1, refCount: true })
  )

  return {
    argsObs: rawDataWithLoadingObs.pipe(
      applyAllArgFilters(argPropertyFilter, log),
      argsFromDataWithLoading
    ) as Observable<ArgsType>,
    argsWithLoadingObs: argsFilteredObs,
    rawDataWithLoadingObs: rawDataWithLoadingObs,
    cache,
  }
}

export const dedupDataWithLoading = <M, ArgsType extends ArgsMap>(
  dataWithLoading: Observable<DataWithLoading<M, ArgsType>>
) => {
  return dataWithLoading.pipe(
    distinctUntilChanged((a, b) => {
      return (
        a.finalValue === b.finalValue &&
        a.isLoading === b.isLoading &&
        isEqual(a.args, b.args)
      )
    })
  )
}

export const buildParamaterizedObsWithCustomLoadingBehavior = <
  M,
  ArgsType extends ArgsMap,
  Name extends KeyType
>(
  name: Name,
  args: ArgsType,
  buildObs: CustomLoadingBuildObsFn<any, M, ArgsType>,
  cacheSpecification?: CacheSpecification,
  log = false
): ParamaterizedObservable<ArgsType, M, Name> => {
  const dataWithLoadingSubject = new BehaviorSubject({
    isLoading: true,
    args,
    metadata: {},
  } as DataWithLoading<M, ArgsType>)

  const cacheSpecificationOrObj =
    cacheSpecification || ({} as CacheSpecification)
  const defaultCache = cacheSpecificationOrObj?.cache || {}

  cacheSpecification = { ...cacheSpecificationOrObj, cache: defaultCache }

  const cacheSubject = new BehaviorSubject(cacheSpecification.cache)

  const cache = buildCacheFromCacheSubject<ArgsType>(cacheSubject, String(name))

  const obsWithLoading = buildObs(
    buildArgsForObsBuilder(
      dataWithLoadingSubject,
      buildOriginalArgsFilter(args),
      cache,
      log
    )
  )

  return buildParamObsFromObs(
    obsWithLoading,
    { ...args },
    (...args) => buildObs(...args),
    dataWithLoadingSubject.getValue(),
    dataWithLoadingSubject,
    name,
    [],
    cacheSubject,
    log
  )
}

export const buildParamaterizedObs = <
  M,
  ArgsType extends ArgsMap,
  Name extends KeyType
>(
  name: Name,
  args: ArgsType,
  buildObs: BuildObsFn<M, ArgsType>,
  cacheSpecification?: CacheSpecification,
  log = false
): ParamaterizedObservable<ArgsType, M, Name> => {
  const dataWithLoadingSubject = new BehaviorSubject({
    isLoading: true,
    args,
    metadata: {},
  } as DataWithLoading<M, ArgsType>)

  const cacheSpecificationOrObj =
    cacheSpecification || ({} as CacheSpecification)
  const defaultCache = cacheSpecificationOrObj?.cache || {}

  cacheSpecification = { ...cacheSpecificationOrObj, cache: defaultCache }

  const cacheSubject = new BehaviorSubject(cacheSpecification.cache)

  const cache = buildCacheFromCacheSubject<ArgsType>(cacheSubject, String(name))

  const obsWithLoadingBuilder = buildLoadingObsBuilder(buildObs, log)
  const obsWithLoading = obsWithLoadingBuilder(
    buildArgsForObsBuilder(
      dataWithLoadingSubject,
      buildOriginalArgsFilter(args),
      cache,
      log
    )
  )

  return buildParamObsFromObs(
    obsWithLoading,
    { ...args },
    obsWithLoadingBuilder,
    dataWithLoadingSubject.getValue(),
    dataWithLoadingSubject,
    name,
    [],
    cacheSubject,
    log
  )
}

const buildParamObsFromObs = <ArgsType, M extends any, Name extends KeyType>(
  obsWithLoading: Observable<DataWithLoading<M, ArgsType>>,
  originalArgs: ArgsType,
  buildObs: CustomLoadingBuildObsFn<any, M, ArgsType>,
  initialLastPipedResult: DataWithLoading<M, ArgsType>,
  argsSubject: BehaviorSubject<DataWithLoading<M, ArgsType>>,
  name: Name,
  pipeOperatorsToSave: OperatorFunction<any, any>[] = [],
  cacheSubject: BehaviorSubject<Record<string, any>>,
  log = false
): ParamaterizedObservable<ArgsType, M, Name> => {
  const cache = buildCacheFromCacheSubject<ArgsType>(cacheSubject, String(name))

  const lastPipedResult = lodashClone(initialLastPipedResult)

  const obsWithLoadingDeduped = obsWithLoading.pipe(
    tap((newResult) => {
      Object.assign(lastPipedResult, newResult)
    }),
    dedupDataWithLoading
  )

  const getLastPipedResult = () => {
    return lastPipedResult
  }

  const obsForDataOnly = pipeToFinalValue(obsWithLoadingDeduped)

  const paramObs = (obsForDataOnly as unknown) as ParamaterizedObservable<
    ArgsType,
    M,
    Name
  >

  paramObs.isLoadingForArgsObs = obsWithLoadingDeduped

  paramObs.attach = (newArgs: ArgsType) => {
    const currentDataWithLoading = argsSubject.getValue()

    const filteredNewArgs = removeFunctionsFromArgs(
      filterUndefFromObj(filterArgsByOriginalArgs(newArgs, originalArgs) as any)
    )

    const update = {
      ...currentDataWithLoading,
      isLoading: true,
      args: { ...currentDataWithLoading.args, ...filteredNewArgs },
    }

    if (!isEqual(update.args, currentDataWithLoading.args)) {
      Object.assign(lastPipedResult, update)
      argsSubject.next(update)
    }

    return paramObs
  }

  const clone = (starterArgs?: ArgsType) => {
    const argsFiltered = filterArgsByOriginalArgs(starterArgs, originalArgs)
    return buildParamaterizedObsWithCustomLoadingBehavior(
      name,
      argsFiltered || getLastPipedResult().args,
      buildObs,
      { cache: cacheSubject.getValue() },
      log
    ) as ParamaterizedObservable<ArgsType, M, Name>
  }

  paramObs.clone = clone

  const getWithArgs: (newArgs: Partial<ArgsType>) => Promise<M> = async (
    newArgs
  ) => {
    return clone(newArgs as ArgsType)
  }

  paramObs.getWithArgs = getWithArgs

  paramObs.withName = (newName) => {
    return buildParamaterizedObsWithCustomLoadingBehavior(
      newName,
      getLastPipedResult().args as ArgsType,
      buildObs,
      { cache: cacheSubject.getValue() },
      log
    )
  }

  paramObs.pipeWithLoading = (
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ArgsType, any, Name> => {
    const finalObsWithLoadingPipe = obsWithLoading.pipe

    const piped = finalObsWithLoadingPipe.apply(obsWithLoading, ([
      ...operations,
    ] as unknown) as [])

    return buildParamObsFromObs(
      piped,
      originalArgs,
      (args) => {
        return buildObs(args).pipe(...(operations as []))
      },
      getLastPipedResult(),
      argsSubject,
      name,
      pipeOperatorsToSave.concat(operations),
      cacheSubject,
      log
    )
  }

  paramObs.pipe = (
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ArgsType, any, Name> => {
    const buildObsFromDedupedLoadingObs = (
      dataWithLoadingToBuildFrom: Observable<DataWithLoading<M, ArgsType>>
    ) => {
      const sharedDataWithLoading = dataWithLoadingToBuildFrom.pipe(
        shareReplay({ refCount: true, bufferSize: 1 })
      )
      const obsForData = sharedDataWithLoading.pipe(pipeToFinalValue)
      const resultPipe = obsForData.pipe
      const pipedResult = resultPipe.apply(obsForData, operations as [])
      const finalValueWithLoading = pipedResult.pipe(
        map(
          (_) =>
            ({
              isLoading: false,
              finalValue: _,
            } as DataWithLoading<M, ArgsType>)
        )
      )

      const argsWithLoading = sharedDataWithLoading.pipe(
        map((dataWithLoading) => {
          return {
            ...omit(dataWithLoading, "finalValue"),
            isLoading: true,
          }
        })
      )

      return combineDataWithLoadingObservables([
        argsWithLoading,
        merge(of({} as any), finalValueWithLoading),
      ]) as Observable<DataWithLoading<M, ArgsType>>
    }

    const newBuildObs: CustomLoadingBuildObsFn<any, M, ArgsType> = (
      allArgsObsForBuilder
    ) => {
      const dedupedInput = buildObs(allArgsObsForBuilder).pipe(
        dedupDataWithLoading
      )
      return buildObsFromDedupedLoadingObs(dedupedInput)
    }

    return buildParamObsFromObs(
      buildObsFromDedupedLoadingObs(obsWithLoadingDeduped),
      originalArgs,
      newBuildObs,
      getLastPipedResult(),
      argsSubject,
      name,
      pipeOperatorsToSave.concat(operations),
      cacheSubject,
      log
    )
  }

  paramObs.name = name

  paramObs.originalArgs = originalArgs

  paramObs.getCurrentParams = () =>
    buildArgsCleaner(buildOriginalArgsFilter(originalArgs))(
      getLastPipedResult()
    ).args as any

  paramObs.getRawParams = () => getLastPipedResult().args
  paramObs.obs = () => {
    return obsForDataOnly
  }

  paramObs.then = (handler) => {
    return firstValueFrom(obsForDataOnly).then(handler)
  }

  paramObs.build = buildObs

  paramObs.observableParams = obsWithLoading.pipe(
    applyAllArgFilters(buildOriginalArgsFilter(originalArgs)),
    argsFromDataWithLoading,
    distinctUntilChanged()
  )

  paramObs.log = (label?: string, overrideMessage?: (value: M) => any) =>
    paramObs.pipe(
      tapWithIndex((_, i) =>
        console.log(label || name, i, overrideMessage ? overrideMessage(_) : _)
      )
    )

  paramObs.cacheBehaviorSubject = cacheSubject

  paramObs.cloneWithCaching = (
    argTransformFn?: (args: ArgsType) => any,
    alwaysReadFromCache = false,
    log = false
  ) => {
    const thisBuildObs: CustomLoadingBuildObsFn<any, M, ArgsType> = (args) => {
      return buildObs(args).pipe(
        buildCachingForDataWithLoading(
          args.cache,
          argTransformFn,
          alwaysReadFromCache
        )
      )
    }

    return buildParamObsFromObs(
      obsWithLoading.pipe(
        buildCachingForDataWithLoading(
          cache,
          argTransformFn,
          alwaysReadFromCache
        )
      ),
      getLastPipedResult().args as ArgsType,
      thisBuildObs,
      getLastPipedResult(),
      argsSubject,
      name,
      pipeOperatorsToSave,
      cacheSubject
    )
  }

  paramObs.logIf = (
    conditional: boolean,
    label?: string,
    overrideMessage?: (value: M) => any
  ) => {
    return paramObs.pipe(
      tapWithIndex(
        (_, i) =>
          conditional &&
          console.log(
            label || name,
            i,
            overrideMessage ? overrideMessage(_) : _
          )
      )
    )
  }

  return paramObs
}
