import { addPronunciationToChunksCallable } from "@/data/callable/functions"
import { DocumentJobSettings } from "@/data/types/DocumentJob"
import { RawParagraph } from "@/data/types/RawParagraph"
import { addPronunciationToChunks } from "@/functions/src/helpers/addPronunciationToChunks"
import { isServerside } from "@/helpers/isServerside"
import { of } from "rxjs"
import { buildChunksFromEmbeddings } from "./buildChunksFromEmbeddings"
import { Chunk } from "./ChunkDisplay"

export const processChunks = (
  lang1Paragraphs: RawParagraph[],
  lang2Paragraphs: RawParagraph[],
  // Question for David: this is where I change the matchLength
  matchLength: number = 2
) => {
  if (!lang1Paragraphs.length || !lang2Paragraphs.length) {
    return null
  }

  const initialChunks = buildChunksFromEmbeddings(
    lang1Paragraphs,
    lang2Paragraphs,
    matchLength
  )

  return initialChunks
}
