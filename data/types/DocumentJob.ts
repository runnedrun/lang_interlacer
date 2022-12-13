import { Timestamp } from "@firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Language } from "./RawParagraph"

export type DocumentJob = Model<
  "documentJob",
  {
    lang1Text?: string
    lang2Text?: string
    provideTranslation?: boolean
    targetLanguage?: Language
    generatePinyin?: boolean
    startJob?: Timestamp
  }
>
