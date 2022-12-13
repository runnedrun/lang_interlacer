import { compareSelections, SelectedSentence } from "@/pages/doc/[docKey]"
import React, { useState } from "react"
import { Chunk, ChunkDisplay } from "./ChunkDisplay"
import { CompareSelectedSentencesDisplay } from "./CompareSelectedSentencesDisplay"

export const ChunksDisplay = ({ chunks }: { chunks: Chunk[] }) => {
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
        <CompareSelectedSentencesDisplay selection={selection} />
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
