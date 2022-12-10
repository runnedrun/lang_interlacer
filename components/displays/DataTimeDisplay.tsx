import { DisplayComponentProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { Typography } from "@mui/material"
import { Timestamp } from "firebase/firestore"
import moment from "moment"

export const DateTimeDisplay = ({
  value,
}: DisplayComponentProps<any, Date | Timestamp>) => {
  if (!value) {
    return <div></div>
  }

  return <Typography>{moment(value).format("MMMM Do YYYY, h:mm a")}</Typography>
}
