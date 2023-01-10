import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import {
  collection,
  query as buildQuery,
  QueryConstraint,
} from "firebase/firestore"
import { combineLatest, isObservable, of, switchMap } from "rxjs"
import { init } from "../initFb"
import { ObsOrValue } from "../types/ObsOrValue"
import { buildConverterForType } from "./buildConverterForType"
import { collectionData } from "./obsFromFbCollection"

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
