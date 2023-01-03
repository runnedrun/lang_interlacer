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
  options: DocumentJobSettings
) => {
  if (!lang1Paragraphs.length || !lang2Paragraphs.length) {
    return of(null)
  }

  const initialChunks = buildChunksFromEmbeddings(
    lang1Paragraphs,
    lang2Paragraphs
  )
  console.log("RUNNING!")

  const addPronunciationFunction = isServerside()
    ? () => Promise.resolve(addPronunciationToChunks(initialChunks))
    : () =>
        addPronunciationToChunksCallable({ chunks: initialChunks }).then(
          (_) => _.data as Chunk[]
        )

  console.log("STILL RUNNING!")

  const withPronunciations = options.showPronunciation
    ? addPronunciationFunction()
    : Promise.resolve(initialChunks)

  return withPronunciations
}
