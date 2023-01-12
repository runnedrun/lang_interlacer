import * as functions from "firebase-functions"
import { getSents } from "../prepEmbedding"
import { prepareEmbeddings } from "../tasks/prepareEmbeddingsTask"

export interface ProcessTestsCallableInput {
  docId: string
  lang1Text: string
  lang2Text: string
}

export const processTestsCallable = functions.https.onCall(
  async (data: ProcessTestsCallableInput, context) => {
    const lang1Sentences = await getSents(data.lang1Text)
    const lang2Sentences = await getSents(data.lang2Text)
    return prepareEmbeddings({
      docId: data.docId,
      lang1Sentences,
      lang2Sentences,
    })
  }
)
