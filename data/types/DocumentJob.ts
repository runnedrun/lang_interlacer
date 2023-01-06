import { Timestamp } from "@firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Language } from "./RawParagraph"

export type DocumentJobSettings = {
  showPronunciation?: boolean
  splitWords?: boolean
  showScores?: boolean
  showHiragana?: boolean
}

export type DocumentJobFile = {
  name?: string
  url?: string
  internalName?: string
}

export type DocumentJob = Model<
  "documentJob",
  {
    lang1Text?: string
    lang2Text?: string
    lang1File?: DocumentJobFile
    lang2File?: DocumentJobFile
    lang1SentenceFile: DocumentJobFile
    lang2SentenceFile: DocumentJobFile
    // lang1Sentences?: string[]
    // lang2Sentences?: string[]
    generateTranslation?: boolean
    targetLanguage?: Language
    generatePinyin?: boolean
    startJob?: Timestamp
    jobCompletedAt?: Timestamp
    settings?: DocumentJobSettings
  }
>
