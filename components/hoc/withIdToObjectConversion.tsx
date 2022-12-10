import { AnyGenericModel } from "@/data/baseTypes/Model"
import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { SingleEditableFieldComponent } from "@/page_helpers/admin/buildDataGridForFieldDisplays"
import React from "react"

export const withIdToObjectConversion = <ModelType extends AnyGenericModel>(
  Component: SingleEditableFieldComponent<ModelType>
) => (props: SingleFieldEditableProps<string>) => {
  const newPropsValue = { uid: props.value } as ModelType
  const newUpdate = (value: ModelType) => {
    const id = value?.uid || null
    props.update(id)
  }
  const newProps = { ...props, update: newUpdate, value: newPropsValue }

  return <Component {...newProps}></Component>
}
