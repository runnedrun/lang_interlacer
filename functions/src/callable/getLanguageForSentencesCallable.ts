import { Language, Sentence } from "@/data/types/RawParagraph"
import * as functions from "firebase-functions"
import { getLanguageForSentences } from "../helpers/getLanguageForSentences"

export type GetLanguageForSentencesInput = {
  sentences: Sentence[]
}

export const getLanguageForSentencesCallable = functions.https.onCall(
  async (data, context) => {
    const { sentences } = data as GetLanguageForSentencesInput
    return getLanguageForSentences(sentences)
  }
)
