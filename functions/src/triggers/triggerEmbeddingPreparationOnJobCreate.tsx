import axios from "axios"
import { Timestamp } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import * as functions from "firebase-functions"
import { DocumentJob } from "../../../data/types/DocumentJob"
import {
  getAndCacheSentences,
  getSentencesFromInternalFilename,
} from "../helpers/sentenceFileHelpers"
import {
  prepareEmbeddings,
  PrepareEmbeddingsTask,
} from "../tasks/prepareEmbeddingsTask"
import {
  translateText,
  TranslateTextTaskData,
} from "../tasks/translateTextTask"

const startEmbeddingTask = (data: PrepareEmbeddingsTask) => {
  if (process.env.NODE_ENV === "development") {
    return prepareEmbeddings(data)
  } else {
    return getFunctions().taskQueue("prepareEmbeddingsTask").enqueue(data)
  }
}

const startTranslationTask = (data: TranslateTextTaskData) => {
  if (process.env.NODE_ENV === "development") {
    console.log("SYNC TRANSLATION")
    return translateText(data)
  } else {
    console.log("TASK TRANSLATION")
    return getFunctions().taskQueue("translateTextTask").enqueue(data)
  }
}

export const triggerEmbeddingPreparationOnJobCreate = functions.firestore
  .document("documentJob/{docId}")
  .onWrite(async (change) => {
    const oldData = change.before.data() as DocumentJob
    const newData = change.after.data() as DocumentJob

    const lastJobTimestamp = new Timestamp(
      oldData?.startJob?.seconds || 0,
      oldData?.startJob?.nanoseconds || 0
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
      !oldData?.lang2SentenceFile && newData.lang2SentenceFile

    if (!(jobStarted || translationComplete)) {
      return
    }

    console.log("lang", newData.targetLanguage)

    const lang1TextPromise = newData.lang1File?.url
      ? axios.get(newData.lang1File?.url).then((_) => _.data)
      : Promise.resolve(newData.lang1Text)

    const lang2TextPromise = newData.lang2File?.url
      ? axios.get(newData.lang2File?.url).then((_) => _.data)
      : Promise.resolve(newData.lang2Text)

    const lang1Text = await lang1TextPromise
    const lang2Text = await lang2TextPromise

    const lang1SentencesPromise = getAndCacheSentences(
      lang1Text,
      change.after.id,
      1
    )

    const lang2SentencesPromise = newData.lang2SentenceFile?.internalName
      ? getSentencesFromInternalFilename(newData.lang2SentenceFile.internalName)
      : lang2Text
      ? getAndCacheSentences(lang2Text, change.after.id, 2)
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
