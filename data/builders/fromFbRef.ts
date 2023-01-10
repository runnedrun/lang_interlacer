import { onSnapshot, SnapshotListenOptions } from "@firebase/firestore"
import { Observable } from "rxjs"

const DEFAULT_OPTIONS = { includeMetadataChanges: false }

export function fromFbRef(
  ref: any,
  options: SnapshotListenOptions = DEFAULT_OPTIONS
): Observable<any> {
  return new Observable((subscriber) => {
    const unsubscribe = onSnapshot(ref, options, {
      next: subscriber.next.bind(subscriber),
      error: subscriber.error.bind(subscriber),
      complete: subscriber.complete.bind(subscriber),
    })
    return { unsubscribe }
  })
}
