import {
  DisplayComponent,
  DisplayComponentProps,
} from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import moment from "moment"
import { ColumnTypes } from "./columnTypes"
import Typography from "@mui/material/Typography"
import { Timestamp } from "@firebase/firestore"
import { isFirebaseTimestamp } from "@/helpers/isFirebaseTimestamp"
import { DateTimeDisplay } from "@/components/displays/DataTimeDisplay"
import { FbTimestampDisplay } from "@/components/displays/FbTimestampDisplay"
import { isUndefinedOrNull } from "@/helpers/isUndefinedOrNull"

export const columnTypeDisplayComponents: Partial<
  Record<ColumnTypes, DisplayComponent<any, any>>
> = {
  dateTime: DateTimeDisplay,
  date: DateTimeDisplay,
  fbTimestamp: FbTimestampDisplay,
}

export const DefaultDisplayField = <
  Props extends DisplayComponentProps<any, string>
>({
  value,
}: Props) => {
  return (
    <div className="overflow-hidden">
      <Typography className="w-full whitespace-pre-wrap break-words">
        {isUndefinedOrNull(value) ? "" : String(value)}
      </Typography>
    </div>
  )
}
