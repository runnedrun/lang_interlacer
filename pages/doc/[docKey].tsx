import { filtered } from "@/data/paramObsBuilders/filtered"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { RawParagraph, Sentence } from "@/data/types/RawParagraph"
import { isServerside } from "@/helpers/isServerside"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { matchSentences } from "@/views/doc/matchSentences"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { Tooltip } from "@mui/material"
import classNames from "classnames"
import { remove, sortBy } from "lodash"
import { dot } from "mathjs"
import React, { useEffect, useMemo, useState } from "react"

const SentDisplay = (props: { sent: string }) => {
  return <div className="mb-3">{props.sent}</div>
}

const dataFunc = memoizeDataFunc((renderId: string) => {
  return {
    enParagraphs: filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        // docKey: staticValue("nyt-1"),
        language: staticValue("1"),
      },
      { orderBy: { chunkIndex: staticValue("desc") } }
    ),
    zhParagraphs: filtered(
      "rawParagraph",
      {
        docKey: stringParam("docKey"),
        // docKey: staticValue("nyt-1"),
        language: staticValue("2"),
      },
      { orderBy: { chunkIndex: staticValue("desc") } }
    ),
  }
})

const SentenceDisplay = ({
  sentence,
  onClick,
  isSelected,
}: {
  sentence: Sentence
  onClick: () => void
  isSelected: boolean
}) => {
  return (
    <div
      onClick={() => {
        onClick()
      }}
      className={classNames("ml-2", { "font-bold": isSelected })}
    >
      {sentence.text}
    </div>
  )
}

type SelectedSentence = { langId: string; index: number; emedding: number[] }

type Selection = SelectedSentence[]

const compareSelections = (
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

const ChunkDisplay = ({
  chunk,
  onSelect,
  currentSelection,
  chunkIndex,
}: {
  chunkIndex: number
  chunk: Chunk
  onSelect: (args: SelectedSentence) => void
  currentSelection: Selection
}) => {
  return (
    <div className="flex flex-col">
      <div>{chunkIndex}</div>
      <div className="font-bold text-lg">{chunk.score}</div>
      <div className="mt-2">
        {chunk.lang1.map((_, i) => (
          <SentenceDisplay
            onClick={() =>
              onSelect({
                langId: "1",
                index: _.sentenceIndex,
                emedding: _.embedding,
              })
            }
            isSelected={compareSelections(currentSelection, {
              langId: "1",
              index: _.sentenceIndex,
              emedding: _.embedding,
            })}
            key={i}
            sentence={_}
          />
        ))}
      </div>
      <div className="mt-2">
        {chunk.lang2.map((_, i) => (
          <SentenceDisplay
            onClick={() =>
              onSelect({
                langId: "2",
                index: _.sentenceIndex,
                emedding: _.embedding,
              })
            }
            isSelected={compareSelections(currentSelection, {
              langId: "2",
              index: _.sentenceIndex,
              emedding: _.embedding,
            })}
            key={i}
            sentence={_}
          />
        ))}
      </div>
    </div>
  )
}

const CompareSelectedChunksDisplay = ({
  selection: [selection1, selection2] = [],
}: {
  selection: SelectedSentence[]
}) => {
  if (!selection1 || !selection2) {
    return <div></div>
  }

  const score = dot(selection1.emedding, selection2.emedding)
  return <div className="text-bold">ScoreFromSelected: {score}</div>
}

const ChunksDisplay = ({ chunks }: { chunks: Chunk[] }) => {
  const [selection, setSelection] = useState([] as SelectedSentence[])

  const addOrRemoveFromSelection = (selectedSentence: SelectedSentence) => {
    setSelection((selection) => {
      const newSelection = selection.filter((selectionToCompare) => {
        return !compareSelections([selectionToCompare], selectedSentence)
      })
      if (newSelection.length === selection.length && selection.length < 2) {
        newSelection.push(selectedSentence)
      }

      return newSelection
    })
  }

  return (
    <div className="flex justify-center">
      <div className="fixed">
        <CompareSelectedChunksDisplay selection={selection} />
      </div>
      <div className="max-w-6xl gap-5 flex">
        <div className="flex flex-col gap-7">
          {chunks.map((chunk, i) => {
            return (
              <ChunkDisplay
                key={i}
                chunk={chunk}
                onSelect={addOrRemoveFromSelection}
                currentSelection={selection}
                chunkIndex={i}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

type Chunk = {
  lang1: Sentence[]
  lang2: Sentence[]
  score: number
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

  return <ChunksDisplay chunks={chunks} />
})

// export const getServerSideProps = async () => {

//   return {
//     props: {
//       enSentencesSplit: enSentencesSplit.results.paragraphs,
//       zhSentencesSplit: zhSentencesSplit.results.paragraphs,
//     },
//   }
// }

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default DocDisplay
