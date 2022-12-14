import { DocumentJobSettings } from "@/data/types/DocumentJob"
import { RawParagraph } from "@/data/types/RawParagraph"
import { addPronunciationToChunks } from "@/functions/src/helpers/addPronunciationToChunks"
import { buildChunksFromEmbeddings } from "./buildChunksFromEmbeddings"

export const processChunks = (
  lang1Paragraphs: RawParagraph[],
  lang2Paragraphs: RawParagraph[],
  options: DocumentJobSettings
) => {
  console.log("BUIKDING")
  const initialChunks = buildChunksFromEmbeddings(
    lang1Paragraphs,
    lang2Paragraphs
  )

  console.log("INITIAL CHUNKs")

  const withPronunciations = options.showPronunciation
    ? addPronunciationToChunks(initialChunks)
    : initialChunks

  return withPronunciations
}
