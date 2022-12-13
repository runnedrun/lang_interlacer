import { Sentence } from "@/data/types/RawParagraph"
import { compareSelections, SelectedSentence } from "@/pages/doc/[docKey]"
import React from "react"
import { SentenceDisplay } from "./SentenceDisplay"

export type Chunk = {
  lang1: Sentence[]
  lang2: Sentence[]
  score: number
}

export const ChunkDisplay = ({
  chunk,
  onSelect,
  currentSelection,
  chunkIndex,
}: {
  chunkIndex: number
  chunk: Chunk
  onSelect: (args: SelectedSentence) => void
  currentSelection: SelectedSentence[]
}) => {
  return (
    <div className="flex flex-col">
      {/* <div>{chunkIndex}</div> */}
      {/* <div className="font-bold text-lg">{chunk.score}</div> */}
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
