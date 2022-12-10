import { Timestamp } from "firebase/firestore"
import { ForeignKey } from "../baseTypes/ForeignKey"
import { Model } from "../baseTypes/Model"
import { Optional } from "../baseTypes/ValueTypes"

export type DocumentEntry = Model<
  "documentEntry",
  {
    textToRomanCharacters?: Record<string, string>
    text: string
    timestampMs?: Number
    label?: Optional<string>
    englishTranslation?: string
    documentKey: ForeignKey<"document">
  }
>
