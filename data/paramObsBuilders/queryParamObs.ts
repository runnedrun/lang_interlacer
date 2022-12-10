import { isServerside } from "@/helpers/isServerside"
import { SingleArgObject } from "@/helpers/SingleArgObject"
import { isSpecialArg } from "@/views/view_builder/processSpecialArgs"
import { getQueryObs } from "@/views/view_builder/queryObs"
import { isEqual, isUndefined } from "lodash"
import Router from "next/router"
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  tap,
} from "rxjs"
import { dedupDataWithLoading } from "../builders/buildParamterizedObs"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { combine } from "./combine"
import { settable } from "./settable"

const cachedObs = {} as Record<string, ParamaterizedObservable<any, any, any>>

let lastRouteWritePromise = Promise.resolve()

const writeToRoute = (newValue, name) => {
  lastRouteWritePromise = lastRouteWritePromise.then(() => {
    return new Promise((resolve) => {
      let currentQuery
      try {
        currentQuery = Router.query
      } catch (e) {
        resolve()
        return
      }

      const newQuery = { ...currentQuery } as any
      if (
        typeof newValue === "undefined" ||
        newValue === null ||
        newValue === ""
      ) {
        delete newQuery[name]
      } else {
        newQuery[name] = newValue
      }

      const resolveRoutePromise = () => {
        Router.events.off("routeChangeComplete", resolveRoutePromise)
        resolve()
      }

      Router.events.on("routeChangeComplete", resolveRoutePromise)

      Router.replace(
        {
          query: newQuery,
        },
        undefined,
        { scroll: false }
      )
    })
  })
}

export const queryParamObs = <ValueType extends any, NameType extends string>(
  name: NameType,
  defaultValue: ValueType,
  processQueryValue: (query: string) => ValueType
): ParamaterizedObservable<
  SingleArgObject<NameType, ValueType>,
  ValueType,
  any
> => {
  const processParam = (param) => {
    if (param === "" || typeof param === "undefined") {
      return defaultValue
    } else {
      return processQueryValue(param)
    }
  }

  const getValueFromQuery = (query) => processParam(query[name])

  if (cachedObs[name] && !isServerside()) {
    return cachedObs[name]
  }

  const writeParam = (newArg) => {
    const newValue = processParam(newArg)
    if (!isServerside()) {
      writeToRoute(newValue, name)
    }
  }

  let valueIndex = 0

  const queryObs = getQueryObs()
  const queryObsForJustThisParam = queryObs
    .pipe(distinctUntilChanged(isEqual), map(getValueFromQuery))
    .pipeWithLoading(shareReplay({ bufferSize: 1, refCount: true }))

  const settableObs = settable(name, { _skipArg: true }, true)
    .pipe(
      map((arg, i) => [arg, i] as const),
      tap((_) => {
        valueIndex++
      }),
      tap(([v, i]) => {
        writeParam(v)
      }),
      map((_) => [valueIndex, _[0]] as const),
      startWith([-1, "_WILL_SKIP_"] as const)
    )
    .pipeWithLoading(shareReplay(1))

  const finalObs = combine(
    {
      writtenValue: settableObs,
      query: queryObsForJustThisParam
        .pipe(
          tap((_) => {
            valueIndex++
          }),
          map((value) => [valueIndex, value] as const)
        )
        .pipeWithLoading(shareReplay({ bufferSize: 1, refCount: true })),
    },
    "combined-query-param"
  )
    .pipeWithLoading(
      dedupDataWithLoading,
      filter(
        (_) =>
          !isUndefined(_?.finalValue?.query) &&
          !isUndefined(_?.finalValue?.writtenValue)
      ),
      map((dataWithLoading) => {
        const {
          finalValue: {
            writtenValue: [lastWrittenIndex, lastWrittenValue],
            query: [lastQueryIndex, lastQueryValue],
          },
        } = dataWithLoading

        const shouldSkipWritten = (lastWrittenValue as any)?._skip
        const returning =
          lastQueryIndex > lastWrittenIndex || shouldSkipWritten
            ? lastQueryValue
            : lastWrittenValue

        dataWithLoading.args = dataWithLoading.isLoading
          ? dataWithLoading.args
          : { ...dataWithLoading.args, [name]: returning }

        return { ...dataWithLoading, finalValue: returning }
      }),
      map((_) => {
        return { ..._, finalValue: processParam(_.finalValue) }
      }),
      distinctUntilChanged((prev, current) => {
        return (
          isEqual(prev?.args, current.args) &&
          isEqual(prev.finalValue, current.finalValue) &&
          current.isLoading
        )
      }),
      distinctUntilChanged((prev, current) => {
        return prev.isLoading !== current.isLoading
      })
    )
    .pipeWithLoading(
      shareReplay({ bufferSize: 1, refCount: true })
    ) as ParamaterizedObservable<
    SingleArgObject<NameType, ValueType>,
    ValueType,
    any
  >

  cachedObs[name] = finalObs

  const paramObsToReturn = cachedObs[name]

  const attach = paramObsToReturn.attach

  paramObsToReturn.attach = (args: SingleArgObject<NameType, ValueType>) => {
    const arg = args[name] as ValueType
    const isSpecial = isSpecialArg(arg)
    const cleanArg = isSpecial ? arg : processParam(arg)
    return attach({ ...args, [name]: cleanArg })
  }

  return paramObsToReturn
}
