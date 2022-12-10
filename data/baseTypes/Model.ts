import { Timestamp } from "firebase/firestore"
import { CollectionModels } from "../firebaseObsBuilders/CollectionModels"
import { ValueTypes } from "./ValueTypes"
import { ForeignKey } from "./ForeignKey"

export type ModelBaseFields = keyof Model<any, {}>
export const BaseFields: ModelBaseFields[] = [
  "uid",
  "archived",
  "archivedOn",
  "createdAt",
  "updatedAt",
]

export type Model<
  CollectionName extends keyof CollectionModels,
  Type extends { [key: string]: ValueTypes }
> = Type & {
  uid: ForeignKey<CollectionName>
  archived?: boolean
  archivedOn?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type AnyGenericModel = Model<any, {}>

export type ModelTypeFromModel<
  FullModel extends AnyGenericModel
> = FullModel extends Model<any, infer ModelType> ? ModelType : never

export type CollectionNameFromModel<
  FullModel extends AnyGenericModel
> = FullModel extends Model<infer CollectionName, any> ? CollectionName : never
