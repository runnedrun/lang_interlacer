import { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { fbSet } from "../helpers/writer"
import { getEmbeddings, saveEmbeddingsAndParagraphs } from "../prepEmbedding"

export type PrepareEmbeddingsTask = {
  docId: string
  lang1Sentences: string[]
  lang2Sentences: string[]
}

export const prepareEmbeddings = async ({
  docId,
  lang1Sentences,
  lang2Sentences,
}: PrepareEmbeddingsTask) => {
  console.log("Preparing embeddings for docId", docId)

  const [
    lang1SentencesEmbeddings,
    lang2SentencesEmbeddings,
  ] = await Promise.all([
    getEmbeddings(lang1Sentences),
    getEmbeddings(lang2Sentences),
  ])

  await Promise.all([
    saveEmbeddingsAndParagraphs(
      lang1Sentences,
      lang1SentencesEmbeddings,
      "1",
      docId
    ),
    saveEmbeddingsAndParagraphs(
      lang2Sentences,
      lang2SentencesEmbeddings,
      "2",
      docId
    ),
  ])

  await fbSet("documentJob", docId, {
    jobCompletedAt: Timestamp.now() as any,
  })

  console.log("embedding prep complete")
}

export const prepareEmbeddingsTask = functions.tasks
  .taskQueue({
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 30,
    },
    rateLimits: {
      maxConcurrentDispatches: 10,
    },
  })
  .onDispatch(async (data) => {
    prepareEmbeddings(data as PrepareEmbeddingsTask)
  })
