import { jsonifyTimestamps } from "@/data/fetchHelpers/jsonifyTimestamps"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { objKeys } from "@/helpers/objKeys"
import { Redirect } from "next"
import { SSRPropsContext } from "next-firebase-auth"
import { getSelectorsByUserAgent } from "react-device-detect"
import { v4 } from "uuid"
import {
  getAllParamObsFromMap,
  getCurrentAgsMapForAllParams,
} from "./getInputsAndValuesFromMapToResolve"
import { possiblyHandleWarmupRequest } from "./possiblyHandleWarmupRequest"
import {
  processServersideSpecialArgs,
  processSpecialArgs,
} from "./processSpecialArgs"
import { queryObsCacheName } from "./queryObs"

export type RequestContext = {
  host: string
  requiresUser?: boolean
}

export type PrefetchFnType<MapToResolve extends Record<any, any>> = (
  ctx: SSRPropsContext
) => Promise<
  | {
      props: {
        cache: Record<string, any>
        context: RequestContext
      }
    }
  | {
      redirect: Redirect
    }
>

export function buildPrefetchHandlerFromSingleObsFn<
  ParamObsType extends ParamaterizedObservable<any, any, any>
>(
  singleParamObsFn: (renderId?: string) => ParamObsType
): PrefetchFnType<{ data: ParamObsType }> {
  return buildPrefetchHandler((renderId) => ({
    data: singleParamObsFn(renderId),
  }))
}

export type ServerValueNames = "isMobile"

type ServerValueGetters = {
  [key in ServerValueNames]: (context: SSRPropsContext) => any
}

export const ServerValueGetters: ServerValueGetters = {
  isMobile: (context) => {
    return getSelectorsByUserAgent(context.req.headers["user-agent"]).isMobile
  },
}

export function buildPrefetchHandler<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve
): PrefetchFnType<MapToResolve> {
  return async (context) => {
    if (await possiblyHandleWarmupRequest(context.query)) {
      return {
        redirect: {
          destination: "/_warmup",
          permanent: false,
        },
      }
    }
    const renderId = v4()
    console.log("starting request Id", renderId)
    const mapToResolve = mapToResolveFn(renderId)
    const allParamObs = getAllParamObsFromMap(mapToResolve)
    const arrayOfParamObs = Object.values(allParamObs)
    const allParamObsPaths = objKeys(allParamObs)
    const allArgsForAllObs = getCurrentAgsMapForAllParams(arrayOfParamObs)

    const contextForProcessor = {
      query: context.query,
      props: {
        userId: context.AuthUser.id,
      },
    }

    const processedArgs = processServersideSpecialArgs(
      processSpecialArgs(allArgsForAllObs, contextForProcessor),
      contextForProcessor
    )

    const serverGeneratedFields = {} as Record<ServerValueNames, any>
    objKeys(ServerValueGetters).forEach((key) => {
      serverGeneratedFields[key] = {}
      serverGeneratedFields[key]["{}"] = ServerValueGetters[key](context)
    })

    const cache = {
      ...serverGeneratedFields,
      [queryObsCacheName]: { "{}": { ...context.query, ...context.params } },
    } as Record<string, any>

    await Promise.all(
      allParamObsPaths.map(async (path) => {
        const obs = allParamObs[path]
        obs.cacheBehaviorSubject.next(cache)
        const value = await obs.getWithArgs(processedArgs)
      })
    )

    const cleanCache = jsonifyTimestamps(cache)

    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate"
    )

    return {
      props: {
        cache: cleanCache,
        context: {
          host: context.req.headers.host as string,
          requiresUser: false,
        },
      },
    }
  }
}
