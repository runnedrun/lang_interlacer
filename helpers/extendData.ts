import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"

export const extendData = <
  OriginalDataMapType extends Record<
    any,
    ParamaterizedObservable<any, any, any>
  >,
  NewDataMapType extends Record<any, ParamaterizedObservable<any, any, any>>
>(
  originalDataFn: (renderId: string) => OriginalDataMapType,
  newDataObj: NewDataMapType
) => (renderId: string) => ({
  ...originalDataFn(renderId),
  ...newDataObj,
})
