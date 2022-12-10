import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"

export const isParamObs = (
  arg: any
): arg is ParamaterizedObservable<any, any, any> => {
  return !!(arg as ParamaterizedObservable<any, any, any>)?.attach
}
