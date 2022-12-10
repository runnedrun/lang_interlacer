import { DisplayComponentProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { Timestamp } from "firebase/firestore"
import { DateTimeDisplay } from "./DataTimeDisplay"

export const FbTimestampDisplay = ({
  value,
  ...rest
}: DisplayComponentProps<any, Timestamp>) => {
  return <DateTimeDisplay {...rest} value={value?.toDate()}></DateTimeDisplay>
}
