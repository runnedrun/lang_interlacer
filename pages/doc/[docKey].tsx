import { filtered } from "@/data/paramObsBuilders/filtered"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { buildCachedParamObsForChunks } from "@/views/doc/buildCachedParamObsForChunks"
import { ChunksDisplay } from "@/views/doc/ChunksDisplay"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { OrderByDirection } from "@firebase/firestore"
import React from "react"

const dataFunc = memoizeDataFunc((renderId: string) => {
  const chunksObs = buildCachedParamObsForChunks(
    filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        language: staticValue("1"),
      },
      { orderBy: { chunkIndex: staticValue("desc" as OrderByDirection) } }
    ),
    filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        language: staticValue("2"),
      },
      { orderBy: { chunkIndex: staticValue("desc" as OrderByDirection) } }
    )
  )

  return {
    chunks: chunksObs,
  }
})

export type SelectedSentence = {
  langId: string
  index: number
  emedding: number[]
}

export const compareSelections = (
  selectionSentences: SelectedSentence[],
  comparingSetence: SelectedSentence
) => {
  return selectionSentences.some((selection) => {
    return (
      selection?.langId === comparingSetence?.langId &&
      selection?.index === comparingSetence?.index
    )
  })
}

const DocDisplay = component(dataFunc, ({ chunks }) => {
  return (
    <div className="w-full flex justify-center mt-5">
      <div className="w-2/3 max-w-2xl">
        <ChunksDisplay chunks={chunks} />
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default DocDisplay
