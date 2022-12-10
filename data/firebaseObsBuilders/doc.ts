import { buildParamaterizedObs } from "@/data/builders/buildParamterizedObs"
import { buildObsForDoc } from "@/data/builders/buildObsForDoc"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { getObsForChild } from "../builders/getObsForChild"
import { ForeignKey } from "../baseTypes/ForeignKey"
import { tap } from "rxjs"
import { Cache } from "../builders/buildCachedSwitchMap"

export const doc = <CollectionName extends keyof CollectionModels>(
  collectionName: CollectionName
): ParamaterizedObservable<
  { key: ForeignKey<CollectionName> },
  CollectionModels[CollectionName],
  `doc-${CollectionName}`
> => {
  const paramKeyName = "key" as const
  const startingArgs = {
    key: undefined as ForeignKey<CollectionName>,
  }

  return buildParamaterizedObs(
    `doc-${collectionName}`,
    startingArgs,
    (results, cache) => {
      return buildObsForDoc(
        collectionName,
        getObsForChild(results, paramKeyName),
        (cache as unknown) as Cache<string>
      )
    }
  )
}
