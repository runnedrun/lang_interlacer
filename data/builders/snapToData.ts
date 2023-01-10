import { DocumentData, DocumentSnapshot } from "firebase/firestore"

export function snapToData<T = DocumentData>(
  snapshot: DocumentSnapshot<T>,
  options: {
    idField?: string
  } = {}
): {} | undefined {
  // TODO clean up the typings
  const data = snapshot.data() as any
  // match the behavior of the JS SDK when the snapshot doesn't exist
  // it's possible with data converters too that the user didn't return an object
  if (!snapshot.exists() || typeof data !== "object" || data === null) {
    return data
  }
  if (options.idField) {
    data[options.idField] = snapshot.id
  }
  return data
}
