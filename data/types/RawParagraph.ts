import { Model } from "../baseTypes/Model"

export enum Language {
  English = "en-US",
  Spanish = "es",
  Chinese = "zh",
  French = "fr",
  German = "de",
  Japanese = "ja",
  Korean = "ko",
  Russian = "ru",
  Italian = "it",
  Portuguese = "pt",
  Dutch = "nl",
  Swedish = "sv",
  Norwegian = "no",
  Danish = "da",
  Finnish = "fi",
  Polish = "pl",
  Czech = "cs",
  Romanian = "ro",
  Hungarian = "hu",
  Greek = "el",
}

export type Sentence = {
  embedding: number[]
  text: string
  sentenceIndex: number
}

export type RawParagraph = Model<
  "rawParagraph",
  {
    docKey: string
    sentences: Sentence[]
    language: string
    chunkIndex: number
  }
>
