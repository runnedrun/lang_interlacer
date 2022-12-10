import jsonStringify from "fast-json-stable-stringify"
import { Cache } from "./buildCachedSwitchMap"
import { get, set } from "lodash"
import { BehaviorSubject } from "rxjs"

export const buildCacheFromCacheSubject = <ArgsType extends any>(
  cacheSubject: BehaviorSubject<Record<string, any>>,
  name: string,
  keyBuilder?: (args: ArgsType) => string
) => {
  const buildCacheKey =
    keyBuilder ||
    ((args: ArgsType) => {
      return `${name}.${jsonStringify(args)}`
    })

  const cache: Cache<ArgsType> = {
    get(args: ArgsType) {
      if (!name) {
        console.log("no name, skipping cache get")
        return
      }

      const key = buildCacheKey(args)

      const cachedData = get(cacheSubject.getValue(), key)

      // cachedData && console.log("read from cache", key, cachedData)

      return cachedData
    },
    set(args: ArgsType, value: any) {
      if (!name) {
        console.log("no name, skipping cache set")
        return
      }

      const key = buildCacheKey(args)
      // console.log("setting in cache", key)
      set(cacheSubject.getValue(), key, value)
    },
    cacheSubject,
  }

  return cache
}
