import { logObs } from "@/helpers/logObs"
import { mountOnceAndIgnore } from "@/helpers/mountOnceAndIgnore"
import { objKeys } from "@/helpers/objKeys"
import { isUndefined, omit, pick, uniqueId } from "lodash"
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  tap,
} from "rxjs"
import {
  applyAllArgFilters,
  buildArgsForObsBuilder,
  buildOriginalArgsFilter,
  buildParamaterizedObsWithCustomLoadingBehavior,
} from "../builders/buildParamterizedObs"
import { combineDataWithMetaAndArgsMerging } from "../builders/combineDataWithLoadingObservables"
import {
  DataWithLoading,
  ParamaterizedObservable,
} from "../ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  NameTypeFromParamObs,
  UnionOfArgs,
  ValueTypeFromParamObs,
} from "./ParamObsTypeUtils"

export type AttachedObs<
  ParamObsType extends ParamaterizedObservable<any, any, any>,
  AttachMapType extends Partial<
    Record<
      keyof ArgsTypeFromParamObs<ParamObsType>,
      ParamaterizedObservable<any, any, any>
    >
  >
> = ParamaterizedObservable<
  Omit<ArgsTypeFromParamObs<ParamObsType>, keyof AttachMapType> &
    UnionOfArgs<AttachMapType>,
  ValueTypeFromParamObs<ParamObsType>,
  NameTypeFromParamObs<ParamObsType>
>

export const attachObs = <
  ParamObsType extends ParamaterizedObservable<any, any, any>,
  AttachMapType extends Partial<
    Record<
      keyof ArgsTypeFromParamObs<ParamObsType>,
      ParamaterizedObservable<any, any, any>
    >
  >
>(
  paramObs: ParamObsType,
  attachMap: AttachMapType,
  log = false
): AttachedObs<ParamObsType, AttachMapType> => {
  const originalObsMapClone = paramObs.getCurrentParams()
  let unionOfNewArgs = {} as UnionOfArgs<AttachMapType>

  objKeys(attachMap).forEach((argToReplace) => {
    const obsToAttach = attachMap[argToReplace]
    if (!obsToAttach) return
    delete originalObsMapClone[argToReplace]
    unionOfNewArgs = { ...unionOfNewArgs, ...obsToAttach.getCurrentParams() }
  })

  const replacedKeysDeleted = {
    ...originalObsMapClone,
  } as Omit<ArgsTypeFromParamObs<ParamObsType>, keyof AttachMapType>

  const newObsMap = {
    ...replacedKeysDeleted,
    ...unionOfNewArgs,
  }

  const valueObsArray = Object.values(attachMap).filter(Boolean)

  const obsWithLoadingArrayForAllAttachedParams = valueObsArray.map((_) =>
    _.isLoadingForArgsObs.pipe(shareReplay({ refCount: true, bufferSize: 1 }))
  )

  const obsWithLoadingForAttachedParams = valueObsArray.length
    ? combineLatest(obsWithLoadingArrayForAllAttachedParams)
    : of([])

  type ParamObsValue = ValueTypeFromParamObs<ParamObsType>
  type AttachedParamObsArgs = ArgsTypeFromParamObs<
    AttachedObs<ParamObsType, AttachMapType>
  >
  type ParamObsName = NameTypeFromParamObs<ParamObsType>

  const obsToReturn = buildParamaterizedObsWithCustomLoadingBehavior<
    ParamObsValue,
    AttachedParamObsArgs,
    ParamObsName
  >(
    paramObs.name,
    newObsMap,
    (allArgsFromBuilder) => {
      const metadataId = uniqueId()
      const {
        rawDataWithLoadingObs: externalArgsWithLoadingObs,
        cache,
      } = allArgsFromBuilder
      const forwardArgsDown = () =>
        externalArgsWithLoadingObs.pipe(
          map((_) => _.args),
          tap((allParamValues) => {
            objKeys(allParamValues).forEach((argName) => {
              const value = allParamValues[argName]
              objKeys(attachMap).forEach((replacingArg) => {
                const attachingOb = attachMap[replacingArg]
                if (
                  (argName as string) in attachingOb.originalArgs &&
                  !isUndefined(value)
                ) {
                  attachingOb.attach({ [argName]: value })
                }
              })
            })
          })
        )

      const attachCaches = () => {
        return cache.cacheSubject.pipe(
          tap((parentCache) => {
            valueObsArray.map((obs) => {
              const currentChildCacheValue = obs.cacheBehaviorSubject.getValue()
              Object.assign(parentCache, currentChildCacheValue)
              obs.cacheBehaviorSubject.next(parentCache)
            })
          })
        )
      }

      const filteredArgsWithLoadingObs = externalArgsWithLoadingObs.pipe(
        applyAllArgFilters((_) => _)
      )

      const allArgWithLoadingObs = [
        filteredArgsWithLoadingObs.pipe(
          startWith({} as DataWithLoading<any, any>)
        ),
        ...obsWithLoadingArrayForAllAttachedParams.map((_) =>
          _.pipe(startWith({} as DataWithLoading<any, any>))
        ),
      ]

      const anExternalArgIsLoadingObs = combineLatest(
        obsWithLoadingArrayForAllAttachedParams
      ).pipe(map((_) => _.some((_) => _.isLoading)))

      const isLoadingObs = merge(
        anExternalArgIsLoadingObs,
        filteredArgsWithLoadingObs.pipe(map((_) => _.isLoading))
      ).pipe(distinctUntilChanged())

      const externalArgsWithLoadingMergedWithInternalArgsWithLoading = combineDataWithMetaAndArgsMerging(
        allArgWithLoadingObs
      )

      const internalAndExternalArgsWithLoading = combineLatest([
        externalArgsWithLoadingMergedWithInternalArgsWithLoading,
        obsWithLoadingForAttachedParams,
        isLoadingObs,
      ]).pipe(
        map(
          ([
            externalArgsWithLoadingMergedWithInternal,
            attachedObsLoadingData,
            isLoading,
          ]) => {
            const attachedObsValues = attachedObsLoadingData.map(
              (loadingData) => loadingData.finalValue
            )

            const keysToReplace = objKeys(attachMap)

            const valuesFromAttachedObs = {} as AttachMapType
            keysToReplace.forEach((key, i) => {
              valuesFromAttachedObs[key] = attachedObsValues[i]
            })

            const allArgsToBuildWith = {
              ...externalArgsWithLoadingMergedWithInternal.args,
              ...valuesFromAttachedObs,
            }

            const externalArgValues = pick(
              allArgsToBuildWith,
              objKeys(newObsMap)
            )

            return {
              underlyingParamIsLoading: isLoading,
              externalArgs: externalArgValues,
              allArgs: allArgsToBuildWith,
              metadata: externalArgsWithLoadingMergedWithInternal.metadata,
            }
          }
        )
      )

      const externalArgsMetadataKey = `externalArgs-${metadataId}`

      const dataWithLoadingObsForOriginalBuilder = internalAndExternalArgsWithLoading.pipe(
        map(({ allArgs, externalArgs, metadata, underlyingParamIsLoading }) => {
          return {
            isLoading: underlyingParamIsLoading,
            args: allArgs,
            metadata: { ...metadata, [externalArgsMetadataKey]: externalArgs },
          } as DataWithLoading<ParamObsValue, any>
        })
      )

      const resultsWithLoadingObs = paramObs
        .build(
          buildArgsForObsBuilder(
            dataWithLoadingObsForOriginalBuilder,
            buildOriginalArgsFilter(paramObs.originalArgs),
            cache,
            log
          )
        )
        .pipe(
          map((finalResult) => {
            return {
              ...finalResult,
              args: finalResult.metadata[externalArgsMetadataKey],
              metadata: omit(finalResult.metadata, externalArgsMetadataKey),
            }
          })
        )

      const finalObsWithUpAndDownArgForwarding = resultsWithLoadingObs.pipe(
        mountOnceAndIgnore(forwardArgsDown()),
        mountOnceAndIgnore(attachCaches(), true),
        shareReplay({ bufferSize: 1, refCount: true })
      )

      return finalObsWithUpAndDownArgForwarding
    },
    { cache: paramObs.cacheBehaviorSubject.getValue() },
    log
  )

  return obsToReturn as AttachedObs<ParamObsType, AttachMapType>
}
