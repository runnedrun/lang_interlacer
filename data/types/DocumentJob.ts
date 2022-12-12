import { Model } from "../baseTypes/Model"
import { Language } from "./RawParagraph"

export type DocumentJob = Model<
  "documentJob",
  {
    lang1Text: string
    lang2TextOrLangToTranslateInto: { text: string } | { langCode: Language }
    generatePinyin: boolean
  }
>
