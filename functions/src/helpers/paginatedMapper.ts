import { AllModels } from "@/data/firebaseObsBuilders/CollectionModels"
import {
  getFirestore,
  QueryDocumentSnapshot,
  FieldPath,
  CollectionReference,
  Query,
} from "firebase-admin/firestore"

interface Options {
  "--wet"?: boolean
  "--probe"?: boolean
}

type CollectionSpec<CollectionName extends keyof AllModels> = {
  collectionName: CollectionName
  buildQuery: (collectionRef: CollectionReference) => Query
}

const isCollectionSpec = (
  specOrName: CollectionSpec<any> | string
): specOrName is CollectionSpec<any> => {
  return !!(specOrName as CollectionSpec<any>).collectionName
}

export const DELETE_KEY = "__DELETE__"

export const paginatedMapper = async <CollectionName extends keyof AllModels>(
  collectionNameOrSpec: CollectionName | CollectionSpec<CollectionName>,
  eachDoc: (
    snap: QueryDocumentSnapshot<AllModels[CollectionName]>
  ) => Promise<Partial<AllModels[CollectionName]> | typeof DELETE_KEY>,
  options?: Options
) => {
  const opts = options || {}
  const dry = !opts["--wet"]
  const probe = opts["--probe"]
  console.log("dry?", dry)

  const firestore = getFirestore()
  const collectionName = isCollectionSpec(collectionNameOrSpec)
    ? collectionNameOrSpec.collectionName
    : collectionNameOrSpec

  const collectionRefWithoutQuery = firestore.collection(collectionName)

  const queryBuilder = isCollectionSpec(collectionNameOrSpec)
    ? collectionNameOrSpec.buildQuery
    : (c: CollectionReference) => c

  const collection = queryBuilder(collectionRefWithoutQuery)

  let writer = firestore.batch()
  let writeCount = 0

  const firstDocQuerySnap = await collection.limit(1).get()
  const firstDoc = firstDocQuerySnap.docs[0]
  if (probe) {
    console.log(`Probe results (${collectionName}):`, firstDoc?.data())
    return
  }
  if (!firstDoc) {
    console.log("no documents in", collectionName)
    return
  }
  let cursor = firstDoc

  const writePromises = []
  while (true) {
    const querySnaps = await collection.limit(400).startAfter(cursor).get()

    const docs =
      cursor === firstDoc ? [firstDoc].concat(querySnaps.docs) : querySnaps.docs

    const updateExists = (updateObjOrDelete: Record<string, any> | string) => {
      return typeof updateObjOrDelete === "object"
        ? updateObjOrDelete && Object.keys(updateObjOrDelete).length > 0
        : updateObjOrDelete == DELETE_KEY
    }

    for (let i = 0; i < docs.length; i++) {
      const querySnap = docs[i]
      const updatePromise = eachDoc(
        querySnap as QueryDocumentSnapshot<AllModels[CollectionName]>
      )

      updatePromise.then((update) => {
        if (updateExists(update)) {
          writeCount++
          if (update === DELETE_KEY) {
            if (dry) {
              console.log("would delete", i, querySnap.id)
            } else {
              writer.delete(querySnap.ref)
            }
          } else if (update && Object.keys(update).length > 0) {
            if (dry) {
              console.log("would write", i, querySnap.id, update)
            } else {
              writer.update(querySnap.ref as any, update as any)
            }
          }

          if (writeCount % 400 === 0) {
            const oldWriter = writer
            writer = firestore.batch()
            console.log("writing batch")
            const writeCompletePromise = !dry
              ? oldWriter.commit()
              : Promise.resolve()
            return writeCompletePromise
          }
        }
        return Promise.resolve() as Promise<any>
      })
      writePromises.push(updatePromise)
    }

    if (querySnaps.docs.length < 400) {
      break
    } else {
      cursor = querySnaps.docs[querySnaps.docs.length - 1]
    }
  }

  await Promise.all(writePromises)

  console.log(writeCount, "writes complete")

  !dry && (await writer.commit())
}
