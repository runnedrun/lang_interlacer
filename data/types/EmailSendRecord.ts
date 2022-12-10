import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"

export enum EmailType {}

export type EmailSendRecord = Model<
  "emailSendRecord",
  {
    emailKey: string
    type: EmailType
    sentAt: Timestamp
    data?: object
  }
>
