import { sortBy } from "lodash"
import { combineLatest, map, Observable, shareReplay } from "rxjs"
import { DataWithLoading } from "../ParamaterizedObservable"
import { ArgsMap } from "./ArgsMap"
import { withGlobalCounter } from "./withGlobalCounter"

export const combineDataWithLoadingObservables = <M, ArgsType extends ArgsMap>(
  dataWithLoading: Observable<DataWithLoading<M, ArgsType>>[]
) => {
  const withCounters = dataWithLoading.map((_) => _.pipe(withGlobalCounter))
  return combineLatest(withCounters).pipe(
    map((dataWithCounters) => {
      const finalValue = sortBy(dataWithCounters, (_) => _[0])
        .map((_) => _[1])
        .reduce((prev, current) => {
          return { ...prev, ...current }
        }, {} as DataWithLoading<M, ArgsType>)

      return finalValue
    })
  )
}

export const combineDataWithMetaAndArgsMerging = <M, ArgsType extends ArgsMap>(
  dataWithLoading: Observable<DataWithLoading<M, ArgsType>>[]
) => {
  const withCounters = dataWithLoading.map((_) =>
    _.pipe(withGlobalCounter, shareReplay({ bufferSize: 1, refCount: true }))
  )
  return combineLatest(withCounters).pipe(
    map((dataWithCounters) => {
      const finalValue = sortBy(dataWithCounters, (_) => _[0])
        .map((_) => _[1])
        .reduce((prev, current) => {
          const metadata = { ...current.metadata, ...prev.metadata }

          const combinedArgs = { ...prev.args, ...current.args }

          const res = {
            ...prev,
            ...current,
            args: combinedArgs,
            metadata: metadata,
          }
          return res
        }, {} as DataWithLoading<M, ArgsType>)

      return finalValue
    })
  )
}
