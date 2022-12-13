import { AnyGenericModel } from "@/data/baseTypes/Model"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { ValueFromArrayParamObsFn } from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { getItemFromModelList } from "@/data/viewDataHelpers/getItemFromModelList"
import { component } from "@/views/view_builder/component"
import {
  buildDocumentDisplayFromFieldDisplays,
  DocumentDisplayBuilder,
} from "./buildDocumentDisplayFromFieldDisplays"

export const buildSingleDocumentDisplay: DocumentDisplayBuilder<{
  docKey: string
}> = (collectionName, dataObsFn) => (adminDisplaySpec, options) => {
  const ComponentFromDoc = buildDocumentDisplayFromFieldDisplays<
    typeof collectionName,
    ValueFromArrayParamObsFn<typeof dataObsFn>
  >(collectionName)(adminDisplaySpec, options)

  const ComponentFromDocKey = component(
    (renderId) => {
      const dataObs = dataObsFn(renderId)
      const itemObs = getItemFromModelList(dataObs, "docKey")
      return {
        data: itemObs,
      }
    },
    ({ data }) => <ComponentFromDoc doc={data}></ComponentFromDoc>
  )

  return ({ docKey }) => (
    <div className="h-full pt-2">
      <ComponentFromDocKey docKey={docKey}></ComponentFromDocKey>
    </div>
  )
}
