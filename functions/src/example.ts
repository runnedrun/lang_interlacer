import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"

export const example = functions.firestore
  .document("themeGenImageJobs/{docId}")
  .onCreate((change) => {
    const firestore = getFirestore()
  })
