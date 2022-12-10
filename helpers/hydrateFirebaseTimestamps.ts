import { Timestamp } from "@firebase/firestore"
import { deepMapObj } from "./deepMapObj"
import { isSerializedFirebaseTimestamp } from "./isFirebaseTimestamp"

export const hydrateFirebaseTimestamps = (objectToHydrate: any) => {
  return deepMapObj(objectToHydrate, (value) => {
    if (isSerializedFirebaseTimestamp(value)) {
      return new Timestamp(value.seconds, value.nanoseconds)
    }
  })
}
