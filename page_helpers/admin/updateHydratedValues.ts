import { AnyGenericModel } from "@/data/baseTypes/Model"
import { setters } from "@/data/fb"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { objKeys } from "@/helpers/objKeys"
import { get, isEqual } from "lodash"
import { HydrationMapFromModelType } from "./buildDocumentDisplayFromFieldDisplays"

const getHydratedObjectKey = (path: string) => {
  const pathParts = path.split(".")
  const joinedWithHydrated = pathParts.join(".hydrated.")
  return `hydrated.${joinedWithHydrated}`
}

export const updateHydratedValues = (
  hydratedFieldsMap: Partial<HydrationMapFromModelType<AnyGenericModel>>,
  newData: AnyGenericModel,
  oldData: AnyGenericModel
) =>
  objKeys(hydratedFieldsMap).forEach((hydratedPathToUpdate) => {
    const path = getHydratedObjectKey(hydratedPathToUpdate)
    const newField = get(newData, path)
    const oldField = get(oldData, path)
    const collectionNameForForeignKey = hydratedFieldsMap[hydratedPathToUpdate]

    if (newField && oldField && !isEqual(newField, oldField)) {
      console.log("updating hydrated field", collectionNameForForeignKey)
      setters[collectionNameForForeignKey as any](newField.uid, newField)
    }
  })
