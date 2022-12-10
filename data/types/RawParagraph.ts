import { Model } from "../baseTypes/Model"

export type Language =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ru"
  | "ja"
  | "zh"

export type RawParagraph = Model<
  "rawParagraph",
  {
    docKey: string
    sentences: {
      embedding: number[]
      text: string
    }[]
    language: string
  }
>
