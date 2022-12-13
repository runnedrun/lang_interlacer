import { Timestamp } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import * as functions from "firebase-functions"
import { DocumentJob } from "../../../data/types/DocumentJob"
import { Language } from "../../../data/types/RawParagraph"
import { fbSet } from "../helpers/writer"
import { getSents } from "../prepEmbedding"
import {
  prepareEmbeddings,
  PrepareEmbeddingsTask,
} from "../tasks/prepareEmbeddingsTask"
import {
  translateText,
  TranslateTextTaskData,
} from "../tasks/translateTextTask"

const getAndCacheSentences = async (
  lang1Text: string,
  docJobKey: string,
  key: "lang1Sentences" | "lang2Sentences"
) => {
  const sentences = await getSents(lang1Text)
  await fbSet("documentJob", docJobKey, {
    [key]: sentences,
  })
  return sentences
}

const startEmbeddingTask = (data: PrepareEmbeddingsTask) => {
  if (process.env.NODE_ENV === "development") {
    return prepareEmbeddings(data)
  } else {
    return getFunctions().taskQueue("prepareEmbeddingsTask").enqueue(data)
  }
}

const startTranslationTask = (data: TranslateTextTaskData) => {
  if (process.env.NODE_ENV === "development") {
    return translateText(data)
  } else {
    return getFunctions().taskQueue("translateTextTask").enqueue(data)
  }
}

export const triggerEmbeddingPreparationOnJobCreate = functions.firestore
  .document("documentJob/{docId}")
  .onUpdate(async (change) => {
    const oldData = change.before.data() as DocumentJob
    const newData = change.after.data() as DocumentJob

    const lastJobTimestamp = new Timestamp(
      oldData.startJob?.seconds || 0,
      oldData.startJob?.nanoseconds || 0
    )

    const currentJobTimestamp = new Timestamp(
      newData.startJob?.seconds || 0,
      newData.startJob?.nanoseconds || 0
    )

    const jobStarted = !currentJobTimestamp.isEqual(lastJobTimestamp)

    console.log(
      "start",
      jobStarted,
      currentJobTimestamp.seconds,
      lastJobTimestamp.seconds
    )

    const translationComplete =
      !oldData.lang2Sentences && newData.lang2Sentences

    if (!(jobStarted || translationComplete)) {
      return
    }

    console.log("lang", newData.targetLanguage)

    const lang1SentencesPromise = getAndCacheSentences(
      newData.lang1Text,
      change.after.id,
      "lang1Sentences"
    )

    const lang2SentencesPromise = newData.lang2Sentences
      ? Promise.resolve(newData.lang2Sentences)
      : newData.lang2Text
      ? getAndCacheSentences(
          newData.lang2Text,
          change.after.id,
          "lang2Sentences"
        )
      : Promise.resolve(null as [])

    const [lang1Sentences, lang2Sentences] = await Promise.all([
      lang1SentencesPromise,
      lang2SentencesPromise,
    ])

    if (!lang2Sentences) {
      const taskData: TranslateTextTaskData = {
        sentences: lang1Sentences,
        targetLang: newData.targetLanguage as any,
        docJobKey: change.after.id,
      }
      return startTranslationTask(taskData)
    }

    const embeddingTaskData: PrepareEmbeddingsTask = {
      lang1Sentences,
      lang2Sentences,
      docId: change.after.id,
    }
    return startEmbeddingTask(embeddingTaskData)
  })
