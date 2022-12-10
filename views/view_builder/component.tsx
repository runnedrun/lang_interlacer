import { hydrateTimestamps } from "@/data/fetchHelpers/jsonifyTimestamps"
import {
  isParameterizedObservable,
  ParamaterizedObservable,
} from "@/data/ParamaterizedObservable"
import { deepMapObj, DeleteField } from "@/helpers/deepMapObj"
import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { toTitleCase } from "@/helpers/toTitleCase"
import { get, isUndefined, merge } from "lodash"
import { AuthAction, withAuthUser } from "next-firebase-auth"
import { useRouter } from "next/router"
import words from "random-words"
import React, { createContext, useContext, useMemo } from "react"
import { RequestContext } from "./buildPrefetchHandler"
import {
  getAllParamObsFromMap,
  getCurrentAgsMapForAllParams,
  getInputsAndValuesFromMapToResolve,
  InputsAndValuesFromMapToResolve,
  PropValuesForComponent,
  ResolvedParamObsOrStaticMap,
} from "./getInputsAndValuesFromMapToResolve"
import { RenderIdContext } from "./RenderIdContext"

type PrefetchCacheData = { cache: any; context: ComponentContext }
const prefetchCache = {} as Record<number, PrefetchCacheData>
let currentPrefetchCacheId = 0
const getNewCacheId = () => {
  currentPrefetchCacheId += 1
  return currentPrefetchCacheId
}

const addToPrefetchCache = (prefetchData: {
  cache: any
  context: ComponentContext
}) => {
  const id = getNewCacheId()
  prefetchCache[id] = prefetchData
  return id
}

const getCachedPrefetchData = (id: number) => {
  return prefetchCache[id] || ({ cache: {}, context: {} } as PrefetchCacheData)
}

const PrefetchCacheIdContext = createContext(null as number)

type PossiblePrefetchData<PrefetchType extends Record<string, any>> = {
  cache?: PrefetchType
  context: RequestContext
}

type ComponentContext = {
  host: string
}

type RenderFn<MapToResolve extends Record<any, any>> = (
  props: InputsAndValuesFromMapToResolve<MapToResolve> & {
    _context: ComponentContext
  }
) => React.ReactElement<any, any>

type Config<MapToResolve extends Record<any, any>> = {
  name?: string
  hideIfUndefined?: (keyof ResolvedParamObsOrStaticMap<MapToResolve>)[]
  hideWhen?: (
    currentValue: ResolvedParamObsOrStaticMap<MapToResolve>
  ) => boolean
  getPrefetchedData?: (
    serverSideData: any,
    props: PropValuesForComponent<MapToResolve>
  ) => Partial<ResolvedParamObsOrStaticMap<MapToResolve>>
}

const isRender = (
  renderOrConfig: RenderFn<any> | Config<any>
): renderOrConfig is RenderFn<any> => {
  return typeof renderOrConfig === "function"
}

const isConfigWithGetPrefetchedData = (
  arg: Config<any> | RenderFn<any>
): arg is Config<any> => !!(arg as Config<any>).getPrefetchedData
const isConfigWithHideWhen = (
  arg: Config<any> | RenderFn<any>
): arg is Config<any> => !!(arg as Config<any>).hideWhen
const isConfigWithHideIfUndef = (
  arg: Config<any> | RenderFn<any>
): arg is Config<any> => !!(arg as Config<any>).hideIfUndefined

const processServerSideArgs = (
  allParamObs: ParamaterizedObservable<any, any, any>[]
) => {
  if (isServerside()) {
    const router = useRouter()
    allParamObs.forEach((obs) => {
      const args = obs.getCurrentParams()
      objKeys(args).forEach((argName) => {
        const argValue = args[argName]
        const context = { query: router.query }
        if (argValue?._buildServerSideValue) {
          const newValue = argValue._buildServerSideValue(context)
          obs.attach({ [argName]: newValue })
        }
      })
    })
  }
}

type BuiltComponent<MapToResolve> = React.ComponentType<
  PropValuesForComponent<MapToResolve>
>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  ChildComponent: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  config: Config<MapToResolve>,
  ChildComponent: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  renderOrConfig: RenderFn<MapToResolve> | Config<MapToResolve>,
  optChildComponent?: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve> {
  const ChildComponent = isRender(renderOrConfig)
    ? renderOrConfig
    : optChildComponent
  const config = isRender(renderOrConfig) ? {} : renderOrConfig

  const Component = (
    props: PossiblePrefetchData<ResolvedParamObsOrStaticMap<MapToResolve>> &
      PropValuesForComponent<MapToResolve>
  ) => {
    const renderId = useContext(RenderIdContext)
    const mapToResolve = useMemo(() => mapToResolveFn(renderId), [])
    const onlyStaticValues = useMemo(
      () =>
        deepMapObj(mapToResolve, (_) =>
          isParameterizedObservable(_) || isUndefined(_)
            ? DeleteField
            : undefined
        ),
      []
    )
    const paramObsMap = useMemo(() => getAllParamObsFromMap(mapToResolve), [])
    const paramObsPaths = objKeys(paramObsMap)
    const allParamObs = Object.values(paramObsMap)
    const paramsMap = getCurrentAgsMapForAllParams(allParamObs)

    const shouldHideComponent = (componentProps) => {
      const hideWhenIsTrue =
        isConfigWithHideWhen(config) && config.hideWhen(componentProps)

      const shouldHideBasedOnSpecifiedUndefinedValues = (isConfigWithHideIfUndef(
        config
      )
        ? config.hideIfUndefined
        : []
      ).some((key) => {
        return typeof componentProps[key] === "undefined"
      })

      const shouldHideBasedOnMissingData = [
        ...paramObsPaths,
        ...objKeys(paramsMap),
      ].some((path) => {
        return isUndefined(get(componentProps, path))
      })

      return (
        shouldHideBasedOnMissingData ||
        hideWhenIsTrue ||
        shouldHideBasedOnSpecifiedUndefinedValues
      )
    }

    const ChildComponentWithAuthIfNeeded = useMemo(() => {
      return React.memo(
        props?.context?.requiresUser
          ? withAuthUser({
              whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
            })(ChildComponent as any)
          : ChildComponent
      ) as typeof ChildComponent
    }, [props?.context?.requiresUser])

    const getComponentPropsWithDefault = () => {
      const resolvedDataInputsAndSetters = getInputsAndValuesFromMapToResolve(
        paramObsMap,
        {
          props,
        }
      )

      return merge(
        {
          ...resolvedDataInputsAndSetters,
        },
        onlyStaticValues
      ) as InputsAndValuesFromMapToResolve<MapToResolve>
    }

    const attachPrefetchCacheToAllObs = (cache: Record<string, any>) => {
      allParamObs.forEach((obs) => {
        obs.cacheBehaviorSubject.next(cache)
      })
    }

    const getComponentContextNoSSR = () => {
      return {
        host: typeof window === "undefined" ? null : window.location.hostname,
      }
    }

    if (props.cache) {
      const componentContext = { host: props.context.host }
      const dataCache = useMemo(() => hydrateTimestamps(props.cache), [])

      attachPrefetchCacheToAllObs(dataCache)
      processServerSideArgs(allParamObs)

      const prefetchId = useMemo(
        () =>
          addToPrefetchCache({ cache: dataCache, context: componentContext }),
        []
      )

      const componentProps = getComponentPropsWithDefault()

      const component = shouldHideComponent(componentProps) ? (
        <div></div>
      ) : (
        <ChildComponentWithAuthIfNeeded
          {...componentProps}
          {...props}
          _context={componentContext}
        ></ChildComponentWithAuthIfNeeded>
      )

      return (
        <PrefetchCacheIdContext.Provider value={prefetchId}>
          {component}
        </PrefetchCacheIdContext.Provider>
      )
    } else {
      const cacheId = useContext(PrefetchCacheIdContext)

      const prefetchData = useMemo(() => {
        return getCachedPrefetchData(cacheId)
      }, [])

      attachPrefetchCacheToAllObs(prefetchData.cache)
      processServerSideArgs(allParamObs)

      const componentProps = getComponentPropsWithDefault()

      const componentContext =
        prefetchData.context || getComponentContextNoSSR()

      return shouldHideComponent(componentProps) ? (
        <span></span>
      ) : (
        <ChildComponentWithAuthIfNeeded
          {...componentProps}
          {...props}
          _context={componentContext}
        />
      )
    }
  }
  Component.displayName =
    config.name ||
    toTitleCase(words({ exactly: 2, join: " " })).replace(" ", "")

  return Component
}

export const rootComponent = <MapToResolve extends Record<any, any>>(
  ChildComponent: RenderFn<MapToResolve>
) => component(() => ({}), ChildComponent)
