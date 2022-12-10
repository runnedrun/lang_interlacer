// import * as md5 from "js-md5"
import {
  ParamObsWorkerInput,
  ParamObsWorkerOutput,
  runWorkerForParamObs,
} from "@/page_helpers/admin/runWorkerForParamObs"
import { BehaviorSubject, combineLatest, of } from "rxjs"
import { AnyGenericModel } from "../baseTypes/Model"
import { hydrateObj } from "./hydrate"

export type HydrationWorkerInputType = ParamObsWorkerInput<
  any[],
  { hydrationMap: any }
>
export type HydrationWorkerOutputType = ParamObsWorkerOutput<any[]>

runWorkerForParamObs<HydrationWorkerInputType, HydrationWorkerOutputType>(
  ({ cache, extraInputs: { hydrationMap }, value }) => {
    return value.length
      ? combineLatest(
          value.map((value) =>
            hydrateObj(value, new BehaviorSubject(cache))(hydrationMap)
          )
        )
      : of([] as AnyGenericModel[])
  }
)
