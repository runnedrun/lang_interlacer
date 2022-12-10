import { Timestamp } from "firebase/firestore"
import { isUndefined } from "lodash"

export const isFirebaseTimestamp = (value: any): value is Timestamp => {
  return !!((value as Timestamp).toMillis && (value as Timestamp).toDate)
}

export const isSerializedFirebaseTimestamp = (
  value: any
): value is Timestamp => {
  return (
    !isUndefined((value as Timestamp)?.seconds) &&
    !isUndefined((value as Timestamp)?.nanoseconds)
  )
}
