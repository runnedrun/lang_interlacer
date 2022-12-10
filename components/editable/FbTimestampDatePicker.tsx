import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { Timestamp } from "@firebase/firestore"
import { DateTimePicker } from "./DateTimePicker"

export const FbTimestampDatePicker = <
  Props extends SingleFieldEditableProps<Timestamp>
>({
  value,
  update,
  ...rest
}: Props) => {
  return (
    <DateTimePicker
      update={(v) => {
        update(Timestamp.fromDate(v))
      }}
      value={value.toDate()}
      {...rest}
    ></DateTimePicker>
  )
}
