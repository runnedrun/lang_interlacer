import { Optional } from "utility-types"
import {
  ForeignKeyOrKeys,
  GetForeignKeyReferenceType,
} from "../baseTypes/ForeignKey"
import { AnyGenericModel } from "../baseTypes/Model"
import { CollectionModels } from "../firebaseObsBuilders/CollectionModels"
import { GetHydratedValue } from "../firebaseObsBuilders/hydrate"
import { buildFieldSetter } from "./buildFieldSetter"
import { getPossibleHydratedValue } from "./getPossibleHydratedValued"

export type Error = {
  message: string
}

export type SingleFieldEditableProps<ValueType> = {
  label?: string
  value: ValueType
  update: (s: ValueType) => void
  onEditingComplete?: () => void
  onEditingCancelled?: () => void
  error?: Error
}

export type EditableFieldProps<RowType, ValueType> = {
  row: RowType
} & SingleFieldEditableProps<ValueType>

type FieldOrForeignType<
  FieldType extends any
> = FieldType extends ForeignKeyOrKeys
  ? GetForeignKeyReferenceType<FieldType>
  : FieldType

export type FieldTypeFromFieldDisplayComponents<
  FieldDisplay extends FieldDisplayComponents<any, any>
> = FieldDisplay extends FieldDisplayComponents<any, infer FieldType>
  ? FieldOrForeignType<FieldType>
  : never

export type ModelFromFieldDisplayComponents<
  FieldDisplay extends FieldDisplayComponents<any, any>
> = FieldDisplay extends FieldDisplayComponents<infer ModelType, any>
  ? ModelType
  : never

export type EditableComponent<
  RowType extends AnyGenericModel,
  FieldType extends any
> = React.ComponentType<
  Optional<EditableFieldProps<RowType, FieldOrForeignType<FieldType>>, "row">
>

export type DisplayComponentProps<RowType, FieldType> = {
  value: FieldOrForeignType<FieldType>
  row: RowType
}

export type DisplayComponent<
  RowType extends AnyGenericModel,
  FieldType extends any
> = React.ComponentType<DisplayComponentProps<RowType, FieldType>>

type ValidationFunc<ModelType extends any, FieldType extends any> = (
  currentRow: ModelType,
  newValue: FieldType,
  hasChanged: boolean
) => Error

export type EditInfo<CollectionNameForEdit extends keyof CollectionModels> = {
  collectionName: CollectionNameForEdit
  fieldName: keyof CollectionModels[CollectionNameForEdit]
}

export type CollectionModelFromEditInfo<
  EditInfoType extends EditInfo<any>
> = CollectionModels[EditInfoType["collectionName"]][EditInfoType["fieldName"]]

export type FieldDisplayComponents<
  CollectionModel extends AnyGenericModel,
  FieldType extends any
> = {
  getter: (row: CollectionModel) => FieldType
  setter?: (row: CollectionModel, newValue: FieldType) => CollectionModel
  editable?: EditableComponent<CollectionModel, FieldType>
  display?: DisplayComponent<CollectionModel, FieldType>
  validate?: ValidationFunc<CollectionModel, FieldType>
}

type FieldDisplayOptions<
  CollectionModel extends AnyGenericModel,
  FieldType extends any
> = {
  validate?: ValidationFunc<CollectionModel, FieldType>
}

export type FieldTypeFromCollectionNameAndField<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel
> = FieldOrForeignType<CollectionModel[FieldName]>

export type HydratedTypeFromCollectionNameAndField<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel
> = CollectionModel[FieldName] extends ForeignKeyOrKeys
  ? CollectionModel & {
      hydrated: {
        [key in FieldName]: GetHydratedValue<
          GetForeignKeyReferenceType<CollectionModel[FieldName]>,
          {}
        >
      }
    }
  : CollectionModel

// const defaultSetter = (row: any, newValue: any) => {
//   console.log("no edit function defined for this cell, cannot persist edits")
// }

export function buildComponentsForField<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel
>(
  fieldName: FieldName,
  displayOptions?: FieldDisplayOptions<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >
): FieldDisplayComponents<
  HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
  FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
> {
  return {
    getter: (row) => getPossibleHydratedValue(row, fieldName as string),
    setter: buildFieldSetter(fieldName),
    ...displayOptions,
  }
}

export function buildComponentsForFieldWithCustomDisplay<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel
>(
  fieldName: FieldName,
  display: DisplayComponent<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >,
  displayOptions?: FieldDisplayOptions<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >
): FieldDisplayComponents<
  HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
  FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
> {
  return {
    getter: (row) => getPossibleHydratedValue(row, fieldName as string),
    setter: buildFieldSetter(fieldName),
    display: display,
    ...displayOptions,
  }
}

export function buildComponentsWithConversion<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel,
  FieldType extends any
>(
  fieldName: FieldName,
  convertTo: (
    value: FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  ) => FieldType,
  convertFrom?: (
    value: FieldType
  ) => FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>,
  displayOptions?: FieldDisplayOptions<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldType
  >
): FieldDisplayComponents<
  HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
  FieldType
> {
  return {
    getter: (row) =>
      convertTo(getPossibleHydratedValue(row, fieldName as string)),
    setter: convertFrom
      ? (row, newValue) => {
          const fieldSetter = buildFieldSetter(fieldName as string)
          const valueToSet = convertFrom(newValue)
          return fieldSetter(
            row,
            valueToSet
          ) as HydratedTypeFromCollectionNameAndField<
            CollectionModel,
            FieldName
          >
        }
      : undefined,
    ...displayOptions,
  }
}

export function buildRowComponentsWithConversion<
  CollectionModel extends AnyGenericModel,
  FieldType extends any
>(
  convertTo: (value: CollectionModel) => FieldType,
  convertFrom?: (value: FieldType) => CollectionModel,
  displayOptions?: FieldDisplayOptions<CollectionModel, FieldType>
): FieldDisplayComponents<CollectionModel, FieldType> {
  return {
    getter: (row) => convertTo(row),
    setter: convertFrom
      ? (row, newValue) => {
          const valueToSet = convertFrom(newValue)
          return valueToSet
        }
      : undefined,
    ...displayOptions,
  }
}

export function buildCustomDisplayComponents<
  CollectionModel extends AnyGenericModel
>(
  display: DisplayComponent<CollectionModel, any>
): FieldDisplayComponents<CollectionModel, any> {
  return {
    getter: (row) => row as CollectionModel,
    display,
  }
}

export function buildCustomEditableComponents<
  CollectionModel extends AnyGenericModel,
  FieldName extends keyof CollectionModel
>(
  fieldName: FieldName,
  editable: EditableComponent<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >,
  display: DisplayComponent<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >,
  displayOptions?: FieldDisplayOptions<
    HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
    FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
  >
): FieldDisplayComponents<
  HydratedTypeFromCollectionNameAndField<CollectionModel, FieldName>,
  FieldTypeFromCollectionNameAndField<CollectionModel, FieldName>
> {
  return {
    getter: (row) => getPossibleHydratedValue(row, fieldName as string),
    setter: buildFieldSetter(fieldName),
    display,
    editable,
    ...displayOptions,
  }
}
