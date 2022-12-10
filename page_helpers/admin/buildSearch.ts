import { ArgsMap } from "@/data/builders/ArgsMap"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { combine } from "@/data/paramObsBuilders/combine"
import { ValueTypeFromArrayParamObs } from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { isServerside } from "@/helpers/isServerside"
import { Leaves } from "@/helpers/Leaves"
import { Document as FlexSearchDocument } from "flexsearch"
import { isNull } from "lodash"
import {
  debounceTime,
  from,
  map,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs"

type Options<ModelType extends { uid: string }> = {
  fieldsToSearchOn: PossibleSearchKeys<ModelType>[]
}

export type PossibleSearchKeys<ModelType extends Record<string, any>> = Leaves<
  ModelType,
  ":"
>

export const buildSearch = <
  ValueType extends { uid: string },
  SearchArgsType extends ArgsMap,
  ValueArgsType extends ArgsMap,
  ParamObsType extends ParamaterizedObservable<ValueArgsType, ValueType[], any>,
  SearchTermObsType extends ParamaterizedObservable<SearchArgsType, string, any>
>(
  searchDataSet: ParamObsType,
  searchTermObs: SearchTermObsType,
  options: Options<ValueTypeFromArrayParamObs<ParamObsType>>
): ParamaterizedObservable<
  SearchArgsType & ValueArgsType,
  ValueType[],
  any
> => {
  const fieldsToQueryString = options.fieldsToSearchOn.map((_) => String(_))
  const doc = new FlexSearchDocument({
    document: {
      id: "uid",
      index: fieldsToQueryString,
    },
    tokenize: "forward",
    worker: !isServerside(),
  })
  const populateDatasetObs = searchDataSet.pipe(
    startWith([] as ValueType[]),
    pairwise(),
    tap(([prev, current]) => {
      const prevMap = {} as Record<string, ValueType>
      const currMap = {} as Record<string, ValueType>
      current.forEach((value) => {
        currMap[value.uid] = value
      })
      prev.forEach((value) => {
        if (currMap[value.uid]) {
          prevMap[value.uid] = value
        } else {
          doc.removeAsync(value.uid)
        }
      })
      current.forEach((value) => {
        doc.addAsync(value.uid, value)
      })
    }),
    map(([_, current]) => {
      return current
    })
  )

  const debouncedQueryObs = searchTermObs.pipe(debounceTime(500))

  const hydratedSearchResultsOrOriginal = combine(
    {
      seachTerm: debouncedQueryObs.pipe(startWith(null)),
      dataset: populateDatasetObs,
    },
    `searchObs-${searchDataSet.name}`
  )
    .pipe(
      switchMap(({ seachTerm, dataset }) => {
        if (isNull(seachTerm) || seachTerm === "") {
          return of(dataset)
        } else {
          return from(
            doc
              .searchAsync(seachTerm || "t", {
                enrich: true,
              })
              .then((results) => {
                const idsOfMatches = new Set() as Set<string>
                results.forEach((matchesForField) => {
                  const returnedIds = matchesForField.result
                  returnedIds.forEach((_) => idsOfMatches.add(String(_)))
                })
                return dataset.filter((_) =>
                  idsOfMatches.has(_.uid)
                ) as typeof dataset
              })
          )
        }
      })
    )
    .pipeWithLoading(shareReplay({ bufferSize: 1, refCount: true }))

  return hydratedSearchResultsOrOriginal as ParamaterizedObservable<
    SearchArgsType & ValueArgsType,
    ValueType[],
    any
  >
}
