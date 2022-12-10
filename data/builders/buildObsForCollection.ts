import {
  collection,
  query as buildQuery,
  QueryConstraint,
} from "firebase/firestore"
import { buildConverterForType } from "./buildConverterForType"
import { collectionData, collection as rxCollection } from "rxfire/firestore"
import {
  combineLatest,
  isObservable,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from "rxjs"
import { ObsOrValue } from "../types/ObsOrValue"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { init } from "../initFb"

export const buildObsForCollection = <
  CollectionName extends keyof CollectionModels,
  M extends CollectionModels[CollectionName]
>(
  collectionName: CollectionName,
  queries: ObsOrValue<QueryConstraint>[]
) => {
  const getCollectionRef = () => {
    const db = init()
    const collectionRef = collection(db, collectionName)
    return collectionRef.withConverter(buildConverterForType<M>())
  }

  const constraintObs = queries.map((constraint) => {
    return isObservable(constraint) ? constraint : of(constraint)
  })

  const combinedConstraints = constraintObs.length
    ? combineLatest(constraintObs)
    : of([] as QueryConstraint[])

  const collectionObs = combinedConstraints.pipe(
    switchMap((constraints) => {
      const nonNullConstraints = constraints.filter(Boolean)
      const query = buildQuery(getCollectionRef(), ...nonNullConstraints)
      return collectionData(query, { idField: "uid" })
    })
  )

  return collectionObs
}
