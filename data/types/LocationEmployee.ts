import { Timestamp } from "firebase/firestore"
import { ForeignKey } from "../baseTypes/ForeignKey"
import { Model } from "../baseTypes/Model"

export interface PhoneNumber {
  number: string
  countryCode: string
  raw: string
}
