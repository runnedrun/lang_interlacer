import {
  DataWithLoading,
  ParamaterizedObservable,
} from "@/data/ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  ValueTypeFromParamObs,
} from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { PropArg } from "@/data/paramObsBuilders/propSpecialArg"
import { ReadOnlyArg } from "@/data/paramObsBuilders/readonlySpecialArg"
import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter"
import { CountdownType } from "@/helpers/countdownType"
import { deepMapObj } from "@/helpers/deepMapObj"
import {
  FilterNotTypeConditionally,
  FilterTypeConditionally,
  OmitKeysConditionally,
} from "@/helpers/FilterTypeConditionally"
import { filterUndefFromObj } from "@/helpers/filterUndef"
import { isParamObs } from "@/helpers/isParamObs"
import { objKeys } from "@/helpers/objKeys"
import { useEffectWithSSR } from "@/helpers/useEffectWithSSR"
import { assign, clone, isEmpty, isEqual, pickBy, set } from "lodash"
import { useMemo, useState } from "react"
import { Optional, UnionToIntersection, ValuesType } from "utility-types"
import {
  processSpecialArgs,
  processSpecialArgsAndExtractValues,
  updateArgMapWithSpecialProcessing,
  ValueTypeFromSpecialArg,
  ViewBuilderSpecialArg,
} from "./processSpecialArgs"

type FilterReadonlyKeys<Source> = OmitKeysConditionally<
  Source,
  ReadOnlyArg<any>
>

type ValueTypeFromArgOrSpecialArg<
  ArgType extends any
> = ArgType extends ViewBuilderSpecialArg<any>
  ? ValueTypeFromSpecialArg<ArgType>
  : ArgType

type SetKey<KeyName extends string> = `set${Capitalize<KeyName>}`

export type ResolvedParamObsOrStaticMap<
  ParamObsOrStaticMap extends Record<any, any>,
  Depth extends number = 5
> = [Depth] extends [never]
  ? never
  : {
      [key in keyof ParamObsOrStaticMap]: ParamObsOrStaticMap[key] extends ParamaterizedObservable<
        any,
        infer ModelType,
        any
      >
        ? ModelType
        : ParamObsOrStaticMap[key] extends Record<any, any>
        ? ParamObsOrStaticMap[key] extends (...any) => any
          ? ParamObsOrStaticMap[key]
          : ResolvedParamObsOrStaticMap<
              ParamObsOrStaticMap[key],
              CountdownType[Depth]
            >
        : ParamObsOrStaticMap[key]
    }

type GetParamObsValues1<DataMap extends Record<any, any>> = ValuesType<
  FilterTypeConditionally<DataMap, ParamaterizedObservable<any, any, any>>
>

type OneLevelDown<DataMap extends Record<any, any>> = Extract<
  ValuesType<
    FilterNotTypeConditionally<DataMap, ParamaterizedObservable<any, any, any>>
  >,
  Record<any, any>
>

type GetParamObsValues2<DataMap extends Record<any, any>> = GetParamObsValues1<
  OneLevelDown<DataMap>
>

type GetParamObsValues3<DataMap extends Record<any, any>> = GetParamObsValues1<
  OneLevelDown<OneLevelDown<DataMap>>
>

type GetParamObsValues4<DataMap extends Record<any, any>> = GetParamObsValues1<
  OneLevelDown<OneLevelDown<OneLevelDown<DataMap>>>
>

type GetAllParamsObsRecursively<DataMap extends Record<any, any>> =
  | GetParamObsValues1<DataMap>
  | GetParamObsValues2<DataMap>
  | GetParamObsValues3<DataMap>
  | GetParamObsValues4<DataMap>

type OnlyPropArgs<T> = T extends T
  ? FilterTypeConditionally<T, PropArg<any, any>>
  : never

type PropsForComponent<DataMap extends Record<any, any>> = OnlyPropArgs<
  UnionToIntersection<ArgsTypeFromParamObs<GetAllParamsObsRecursively<DataMap>>>
>

type AllPropsForComponent<DataMap extends Record<any, any>> = {
  [propName in keyof PropsForComponent<DataMap>]: PropsForComponent<DataMap>[propName]
}

type OptionalizedPropsForComponent<DataMap extends Record<any, any>> = Optional<
  AllPropsForComponent<DataMap>,
  keyof FilterTypeConditionally<
    AllPropsForComponent<DataMap>,
    PropArg<any, true>
  >
>

export type PropValuesForComponent<DataMap extends Record<any, any>> = {
  [propName in keyof OptionalizedPropsForComponent<DataMap>]: ValueTypeFromArgOrSpecialArg<
    OptionalizedPropsForComponent<DataMap>[propName]
  >
}

type SettersFromMapToResolve<MapToResolve extends Record<any, any>> = {
  [key in keyof FilterReadonlyKeys<
    UnionToIntersection<
      ArgsTypeFromParamObs<GetAllParamsObsRecursively<MapToResolve>>
    >
  > &
    string as SetKey<key>]: (
    arg: ValueTypeFromArgOrSpecialArg<
      FilterReadonlyKeys<
        UnionToIntersection<
          ArgsTypeFromParamObs<GetAllParamsObsRecursively<MapToResolve>>
        >
      >[key]
    >
  ) => void
}

type SettersFromParamObsPathMap<
  ParamObsPathMap extends Record<any, ParamaterizedObservable<any, any, any>>
> = {
  [key in keyof FilterReadonlyKeys<
    UnionToIntersection<ArgsTypeFromParamObs<ValuesType<ParamObsPathMap>>>
  > &
    string as SetKey<key>]: (
    arg: ValueTypeFromArgOrSpecialArg<
      FilterReadonlyKeys<
        UnionToIntersection<ArgsTypeFromParamObs<ValuesType<ParamObsPathMap>>>
      >[key]
    >
  ) => void
}

export type SettersAndValuesFromMapToResolve<
  MapToResolve extends Record<any, any>
> = { isLoading: boolean } & SettersFromMapToResolve<MapToResolve> &
  {
    [key in keyof UnionToIntersection<
      ArgsTypeFromParamObs<GetAllParamsObsRecursively<MapToResolve>>
    >]: ValueTypeFromArgOrSpecialArg<
      UnionToIntersection<
        ArgsTypeFromParamObs<GetAllParamsObsRecursively<MapToResolve>>
      >[key]
    >
  }

type SettersAndValuesFromParamObsPathMap<
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
> = { isLoading: boolean } & SettersFromParamObsPathMap<ParamObsPathMap> &
  {
    [key in keyof UnionToIntersection<
      ArgsTypeFromParamObs<ValuesType<ParamObsPathMap>>
    >]: ValueTypeFromArgOrSpecialArg<
      UnionToIntersection<
        ArgsTypeFromParamObs<ValuesType<ParamObsPathMap>>
      >[key]
    >
  }

export type InputsAndValuesFromMapToResolve<
  MapToResolve extends Record<any, any>
> = ResolvedParamObsOrStaticMap<MapToResolve> &
  SettersAndValuesFromMapToResolve<MapToResolve>

export type ResolvedDataFromParamObsPathMap<
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
> = {
  [key in keyof ParamObsPathMap]: ValueTypeFromParamObs<ParamObsPathMap[key]>
}

export type InputsAndValuesFromParamObsPathMap<
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
> = SettersAndValuesFromParamObsPathMap<ParamObsPathMap> &
  ResolvedDataFromParamObsPathMap<ParamObsPathMap>

const isReadOnly = (value) => value?._readonly

export const getAllParamObsFromMap = (mapToResolve: Record<any, any>) => {
  const allParamObs = {} as { string: ParamaterizedObservable<any, any, any> }
  deepMapObj(mapToResolve, (value, path) => {
    if (isParamObs(value)) {
      allParamObs[path] = value
    }
  })
  return allParamObs
}

export const getCurrentAgsMapForAllParams = (
  allParamObsArray: ParamaterizedObservable<any, any, any>[]
) => {
  const allParamObsArgs = allParamObsArray.map((_) => _.getCurrentParams())
  return assign({}, ...allParamObsArgs)
}

export const runSpecialArgsProcessorsOnPropsUpdate = <
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
>(
  paramObsPathMap: ParamObsPathMap,
  context: {
    props: Record<string, any>
  }
) => {
  const attachToAllParamObs = (argsToAttach: Record<string, any>) => {
    allParamObs.forEach((_) => _.attach(argsToAttach))
  }

  const allParamObsKeys = Object.keys(paramObsPathMap)
  const allParamObs = allParamObsKeys.map((_) => paramObsPathMap[_])

  const runSpecialArgsProcessors = (props: any) => {
    allParamObs.forEach((paramObs) => {
      const currentParams = paramObs.getCurrentParams()
      const newArgsMap = processSpecialArgs(currentParams, context)

      const processedArgs = pickBy(newArgsMap, (v, k) => {
        return !isEqual(currentParams[k], v)
      })

      if (!isEmpty(processedArgs)) {
        paramObs.attach(processedArgs)
      }
    })
  }

  useEffectWithSSR(() => {
    runSpecialArgsProcessors(context.props)
  }, [context.props])
}

export const buildSetKey = (key: string) => `set${capitalizeFirstLetter(key)}`

export const buildSetters = <
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
>(
  paramObsPathMap: ParamObsPathMap
): SettersFromParamObsPathMap<ParamObsPathMap> => {
  const allParamObsKeys = Object.keys(paramObsPathMap)
  const allParamObs = allParamObsKeys.map((_) => paramObsPathMap[_])
  const mergedArgs = getCurrentAgsMapForAllParams(allParamObs)

  const attachToAllParamObsWithSpecialArgsProcessing = (
    key: string,
    value: any
  ) => {
    allParamObs.forEach((paramObs) => {
      const processedArgs = updateArgMapWithSpecialProcessing(
        paramObs.getCurrentParams(),
        key,
        value
      )

      paramObs.attach(processedArgs)
    })
  }
  const setters = useMemo(() => {
    const settableKeysOnly = objKeys(mergedArgs).filter((key) => {
      const initialValue = mergedArgs[key]
      return !isReadOnly(initialValue)
    }) as Extract<
      keyof FilterReadonlyKeys<
        ArgsTypeFromParamObs<ValuesType<ParamObsPathMap>>
      >,
      string
    >[]

    const settersInner = {} as SettersFromParamObsPathMap<ParamObsPathMap>

    settableKeysOnly.forEach((key) => {
      const setKey = (buildSetKey(
        key
      ) as unknown) as keyof SettersFromParamObsPathMap<ParamObsPathMap>

      const setFunc = ((value) => {
        attachToAllParamObsWithSpecialArgsProcessing(key, value)
      }) as any

      settersInner[setKey] = setFunc
    })

    return filterUndefFromObj(settersInner)
  }, [])

  return setters
}

const getData = <
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
>(
  paramObsPathMap: ParamObsPathMap,
  context: { props: Record<string, any> }
): SettersAndValuesFromParamObsPathMap<ParamObsPathMap> => {
  const allParamObsKeys = Object.keys(paramObsPathMap)
  const allParamObs = allParamObsKeys.map((_) => paramObsPathMap[_])

  const [dataWithInfoState, setDataWithInfoState] = useState(
    {} as Record<string, DataWithLoading<any, any>>
  )

  const mountDataListenersAndGetSyncAvailableData = () => {
    let isFirstSyncronousRender = true
    useEffectWithSSR(() => {
      const unsubs = objKeys(paramObsPathMap).map((path) => {
        const obs = paramObsPathMap[path]

        const sub = obs.isLoadingForArgsObs.subscribe(
          (dataWithInfo: DataWithLoading<any, any>) => {
            if (isFirstSyncronousRender) {
              dataWithInfoState[path as any] = dataWithInfo
            } else {
              setDataWithInfoState((current) => {
                const currentClone = clone(current)
                currentClone[path as any] = dataWithInfo
                return currentClone
              })
            }
          }
        )

        return () => {
          sub.unsubscribe()
        }
      })
      return () => {
        unsubs.forEach((_) => _())
      }
    }, [])
    isFirstSyncronousRender = false
  }

  const processDataWithInfo = (
    allDataWithInfos: Record<string, DataWithLoading<any, any>>
  ) => {
    const dataInputsAndInfo = {} as SettersAndValuesFromParamObsPathMap<ParamObsPathMap>
    objKeys(allDataWithInfos).forEach((path) => {
      const dataWithInfo = allDataWithInfos[path]
      const result = dataWithInfo.finalValue
      const isLoading = dataWithInfo.isLoading
      const args = dataWithInfo.args

      const processedArgs = processSpecialArgsAndExtractValues(args || {}, {
        ...context,
      })

      Object.assign(dataInputsAndInfo, processedArgs)
      set(dataInputsAndInfo, path, result)
      if (isLoading) {
        dataInputsAndInfo["isLoading"] = true
      }
    })

    dataInputsAndInfo["isLoading"] = !!dataInputsAndInfo["isLoading"]
    return dataInputsAndInfo
  }

  mountDataListenersAndGetSyncAvailableData()
  const dataInputsAndLoading = processDataWithInfo(dataWithInfoState)

  return dataInputsAndLoading
}

export const getInputsAndValuesFromMapToResolve = <
  ParamObsPathMap extends Record<string, ParamaterizedObservable<any, any, any>>
>(
  paramObsWithPaths: ParamObsPathMap,
  context: { props: Record<string, any> }
): InputsAndValuesFromParamObsPathMap<ParamObsPathMap> => {
  runSpecialArgsProcessorsOnPropsUpdate(paramObsWithPaths, context)
  return {
    ...buildSetters(paramObsWithPaths),
    ...getData(paramObsWithPaths, context),
  } as InputsAndValuesFromParamObsPathMap<ParamObsPathMap>
}
