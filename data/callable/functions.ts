import { AddPronunciationToChunksInput } from "@/functions/src/callable/addPronunciationToChunksCallable"
import { GetLanguageForSentencesInput } from "@/functions/src/callable/getLanguageForSentencesCallable"
import { isDemoMode } from "@/helpers/isDemoMode"
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions"
import { init } from "../initFb"

const buildCallableFunction = <ArgType>(funcName) => {
  init()
  const functions = getFunctions()
  isDemoMode() && connectFunctionsEmulator(functions, "localhost", 5011)
  const func = httpsCallable(functions, funcName)
  return (args: ArgType) => {
    return func(args)
  }
}

export const addPronunciationToChunksCallable = buildCallableFunction<AddPronunciationToChunksInput>(
  "addPronunciationToChunksCallable"
)

export const getLanguageForSentencesCallable = buildCallableFunction<GetLanguageForSentencesInput>(
  "getLanguageForSentencesCallable"
)

// export const sendMetricsReportTestEmail = buildCallableFunction<SendMetricsReportTestEmailArgs>(
//   "sendMetricsReportTestEmail"
// )
