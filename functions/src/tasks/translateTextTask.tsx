import batchPromises from "batch-promises"
import * as deepl from "deepl-node"
import * as functions from "firebase-functions"
import { chunk, maxBy } from "lodash"
import { uploadSentenceFile } from "../helpers/sentenceFileHelpers"
import { fbSet } from "../helpers/writer"
import { getSents } from "../prepEmbedding"

const deeplKey = functions.config().deep_l?.api_key || ""

!deeplKey && console.error("No deepl key found")

const translator = new deepl.Translator(deeplKey)

export type TranslateTextTaskData = {
  sentences: string[]
  targetLang: deepl.TargetLanguageCode
  docJobKey: string
}

export const translateText = async (data: TranslateTextTaskData) => {
  console.log("beginning translation for ", data.sentences.length, "sentences")
  const translatedChunks = []
  const chunked = chunk(data.sentences, 30)

  await batchPromises(
    5,
    Array.from(chunked.entries()),
    async ([i, page]: [number, string[]]) => {
      const joinedSentences = page.join(" ")
      if (joinedSentences.length > 10000) {
        const longest = maxBy(page, (s) => s.length)
        console.log("lonnnggg", longest.length, longest.slice(0, 1000))
      }
      const translation = await translator.translateText(
        joinedSentences,
        null,
        data.targetLang
      )
      translatedChunks[i] = translation.text
    }
  )

  const allTextJoined = translatedChunks.join(" ")
  const sentencesAgain = await getSents(allTextJoined)

  await uploadSentenceFile(sentencesAgain, data.docJobKey, 2)

  console.log("translation job complete")
}

export const translateTextTask = functions
  .runWith({
    timeoutSeconds: 540,
  })
  .tasks.taskQueue({
    retryConfig: {
      maxAttempts: 1,
      minBackoffSeconds: 30,
    },
    rateLimits: {
      maxConcurrentDispatches: 1,
    },
  })
  .onDispatch(async (data) => {
    const typed = data as TranslateTextTaskData
    return translateText(typed)
  })
