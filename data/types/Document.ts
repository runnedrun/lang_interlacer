import { Timestamp } from "firebase/firestore"
import { ForeignKey } from "../baseTypes/ForeignKey"
import { Model } from "../baseTypes/Model"
import { Optional } from "../baseTypes/ValueTypes"
import { User } from "./User"

export type Document = Model<
  "document",
  {
    subtitle: string
    title: string
    headerImageHref?: Optional<string>
    published: boolean
    publishedOn?: Timestamp
    userKey: ForeignKey<"publicUser">
  }
>
