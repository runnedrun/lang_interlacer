import { Cache } from "./buildCachedSwitchMap"

export const buildNoOpCache = <ArgsType extends any>() => {
  return {
    get: (args: ArgsType) => undefined,
    set: (args: ArgsType, value) => {},
  } as Cache<ArgsType>
}
