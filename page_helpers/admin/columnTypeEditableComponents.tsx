import { DateTimePicker } from "@/components/editable/DateTimePicker"
import { EditableText } from "@/components/editable/EditableText"
import { FbTimestampDatePicker } from "@/components/editable/FbTimestampDatePicker"
import { EditableComponent } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { ColumnTypes } from "./columnTypes"
import { EditableTextField } from "./EditableTextField"

export const columnTypeEditableComponents: Partial<
  Record<ColumnTypes, EditableComponent<any, any>>
> = {
  dateTime: DateTimePicker,
  text: EditableTextField,
  fbTimestamp: FbTimestampDatePicker,
}

export const DefaultEditableField = EditableText
