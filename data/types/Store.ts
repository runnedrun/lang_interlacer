import { ForeignKey } from "../baseTypes/ForeignKey"
import { Model } from "../baseTypes/Model"

export type Address = {
  street: string
  city: string
  state: string
  zip: string
}

export enum EmailFrequency {
  "monthly" = 1,
  "biweekly" = 2,
  "weekly" = 3,
  "daily" = 4,
}
