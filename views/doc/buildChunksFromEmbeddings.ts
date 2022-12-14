import { RawParagraph, Sentence } from "@/data/types/RawParagraph"
import { sortBy } from "lodash"
import { Chunk } from "./ChunkDisplay"
import { matchSentences } from "./matchSentences"

export const buildChunksFromEmbeddings = (
  lang1Paragraphs: RawParagraph[],
  lang2Paragraphs: RawParagraph[]
): Chunk[] => {
  const allEnSentences = sortBy(
    lang1Paragraphs.flatMap((p) => p.sentences),
    "sentenceIndex"
  )
  const allZhSentences = sortBy(
    lang2Paragraphs.flatMap((p) => p.sentences),
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

  return chunks
}
