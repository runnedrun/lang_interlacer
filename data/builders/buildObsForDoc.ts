import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { collection, doc } from "firebase/firestore"
import { cloneDeep, isEqual } from "lodash"
import {
  BehaviorSubject,
  filter,
  isObservable,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  tap,
} from "rxjs"
import { init } from "../initFb"
import { ObsOrValue } from "../types/ObsOrValue"
import { buildCachedSwitchMap, Cache } from "./buildCachedSwitchMap"
import { buildConverterForType } from "./buildConverterForType"
import { buildNoOpCache } from "./buildNoOpCache"
import { fromFbRef } from "./fromFbRef"

type PossibleString = null | string | undefined

const listenerCacheById: Record<string, Observable<any>> = {}

const buildCacheId = (collectionName: string, id: string) =>
  `${collectionName}::--::${id}`

export const buildObsForDoc = <
  CollectionName extends keyof CollectionModels,
  M extends CollectionModels[CollectionName]
>(
  collectionName: CollectionName,
  id: ObsOrValue<PossibleString>,
  cache?: Cache<string>
) => {
  const idObs = isObservable(id) ? id : of(id)

  return idObs.pipe(
    buildCachedSwitchMap(cache || buildNoOpCache(), (id) => {
      const db = init()
      if (id) {
        const stringId = String(id)
        const listenerCacheId = buildCacheId(collectionName, stringId)
        const existingListener = listenerCacheById[listenerCacheId]
        if (existingListener) {
          return existingListener
        } else {
          const docRef = doc(collection(db, collectionName), stringId)
          const convertedDoc = docRef.withConverter(buildConverterForType<M>())
          const newListener = fromFbRef(convertedDoc).pipe(
            startWith(undefined),
            pairwise(),
            filter(([prev, current]) => {
              if (prev?.metadata.fromCache && !current.metadata.fromCache) {
                return !isEqual(prev.data(), current.data())
              } else {
                return true
              }
            }),
            map(([prev, current]) => {
              return { ...current.data(), uid: current.id }
            }),
            map((_) => (typeof _ == "undefined" ? null : _)),
            shareReplay({ bufferSize: 1, refCount: true }),
            map((_) => cloneDeep(_))
          )
          listenerCacheById[stringId] = newListener
          return newListener
        }
      } else {
        const emptyObs = new BehaviorSubject<M>(null as M)
        return emptyObs
      }
    })
  )
}
