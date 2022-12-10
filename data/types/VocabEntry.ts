import { ForeignKey } from "../baseTypes/ForeignKey"
import { Model } from "../baseTypes/Model"

export type VocabEntry = Model<
  "vocabEntry",
  {
    hanzi: string
    pinyin: string
    english?: string
    documentKey: ForeignKey<"document">
    documentEntryKey: ForeignKey<"documentEntry">
  }
>
