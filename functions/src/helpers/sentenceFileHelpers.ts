import admin from "firebase-admin"
import { getSents } from "../prepEmbedding"
import { fbSet } from "./writer"

const uploadTextFile = async (filename: string, fileContents: string) => {
  const bucket = admin.storage().bucket()
  const metadata = {
    contentType: "txt",
    cacheControl: "public, max-age=31536000",
  }

  const file = bucket.file(filename)
  await file.save(fileContents, {
    resumable: false,
    metadata: metadata,
    validation: false,
  })

  return filename
}

const sentenceFileSplitToken = "[[SPLIT]]"

const getSentencesFileKey = (langNumber: number) =>
  `lang${langNumber}SentenceFile`

const getSentenceFileFileName = (docJobKey: string, langNumber: number) =>
  `document-job-sentences/${docJobKey}-${langNumber}`

export const uploadSentenceFile = async (
  sentences: string[],
  docJobKey: string,
  langNumber: number
) => {
  const fileName = getSentenceFileFileName(docJobKey, langNumber)
  const sentenceString = sentences.join(sentenceFileSplitToken)
  await uploadTextFile(fileName, sentenceString)
  const fileObj = { internalName: fileName }
  const docFieldKey = getSentencesFileKey(langNumber)
  await fbSet("documentJob", docJobKey, {
    [docFieldKey]: fileObj,
  })
}

export const getAndCacheSentences = async (
  lang1Text: string,
  docJobKey: string,
  langNumber: 1 | 2
) => {
  const sentences = await getSents(lang1Text)
  await uploadSentenceFile(sentences, docJobKey, langNumber)
  return sentences
}

export const getSentencesFromInternalFilename = async (filename: string) => {
  const bucket = admin.storage().bucket()
  const file = bucket.file(filename)
  const resp = await file.download()

  const sentences = resp[0].toString().split(sentenceFileSplitToken)
  return sentences
}
