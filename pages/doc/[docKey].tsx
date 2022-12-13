import { filtered } from "@/data/paramObsBuilders/filtered"
import { settable } from "@/data/paramObsBuilders/settable"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { Sentence } from "@/data/types/RawParagraph"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { ChunksDisplay } from "@/views/doc/ChunksDisplay"
import { matchSentences } from "@/views/doc/matchSentences"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { sortBy } from "lodash"
import React from "react"

const dataFunc = memoizeDataFunc((renderId: string) => {
  return {
    enParagraphs: filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        language: staticValue("1"),
      },
      { orderBy: { chunkIndex: staticValue("desc") } }
    ),
    zhParagraphs: filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        language: staticValue("2"),
      },
      { orderBy: { chunkIndex: staticValue("desc") } }
    ),
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

const DocDisplay = component(dataFunc, ({ enParagraphs, zhParagraphs }) => {
  const allEnSentences = sortBy(
    enParagraphs.flatMap((p) => p.sentences),
    "sentenceIndex"
  )
  const allZhSentences = sortBy(
    zhParagraphs.flatMap((p) => p.sentences),
    "sentenceIndex"
  )

  const path = matchSentences(allEnSentences, allZhSentences, 3)

  const chunks = path.map((node) => {
    const enForCluster = allEnSentences.slice(node.lang1.start, node.lang1.end)
    const zhForCluster = allZhSentences.slice(node.lang2.start, node.lang2.end)

    return {
      lang1: enForCluster,
      lang2: zhForCluster,
      score: node.score,
    }
  })

  const lastEnIndex = path[path.length - 1].lang1.end

  const enSentsRemaining = allEnSentences.slice(lastEnIndex)
  const extraEnCluster = enSentsRemaining.length
    ? {
        lang1: enSentsRemaining,
        lang2: [] as Sentence[],
        score: 0,
      }
    : null

  const lastZhIndex = path[path.length - 1].lang2.end
  const zhSentsRemaining = allZhSentences.slice(lastZhIndex)
  const extraZhCluster = zhSentsRemaining.length
    ? {
        lang1: [] as Sentence[],
        lang2: zhSentsRemaining,
        score: 0,
      }
    : null

  extraZhCluster && chunks.push(extraZhCluster)
  extraEnCluster && chunks.push(extraEnCluster)

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
