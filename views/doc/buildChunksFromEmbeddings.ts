import { RawParagraph, Sentence } from "@/data/types/RawParagraph"
import { sortBy } from "lodash"
import { Chunk } from "./ChunkDisplay"
import { matchSentences } from "./matchSentences"

export const buildChunksFromEmbeddings = (
  lang1Paragraphs: RawParagraph[],
  lang2Paragraphs: RawParagraph[],
  matchLength: number
): Chunk[] => {
  const allLang1Sentences = sortBy(
    lang1Paragraphs.flatMap((p) => p.sentences),
    "sentenceIndex"
  )
  const allLang2Sentences = sortBy(
    lang2Paragraphs.flatMap((p) => p.sentences),
    "sentenceIndex"
  )

  const path = matchSentences(
    allLang1Sentences,
    allLang2Sentences,
    matchLength,
    3
  )

  const chunks = path.map((node) => {
    const lang1ForCluster = allLang1Sentences.slice(
      node.lang1.start,
      node.lang1.end
    )

    const lang2ForCluster = allLang2Sentences.slice(
      node.lang2.start,
      node.lang2.end
    )

    return {
      lang1: lang1ForCluster,
      lang2: lang2ForCluster,
      score: node.score,
    }
  })

  const lastLang1Index = path[path.length - 1].lang1.end

  const lang1SentsRemaining = allLang1Sentences.slice(lastLang1Index)
  const extraLang1Cluster = lang1SentsRemaining.length
    ? {
        lang1: lang1SentsRemaining,
        lang2: [] as Sentence[],
        score: 0,
      }
    : null

  const lastLang2Index = path[path.length - 1].lang2.end
  const lang2SentencesRemaining = allLang2Sentences.slice(lastLang2Index)
  const extraLang2Cluster = lang2SentencesRemaining.length
    ? {
        lang1: [] as Sentence[],
        lang2: lang2SentencesRemaining,
        score: 0,
      }
    : null

  extraLang2Cluster && chunks.push(extraLang2Cluster)
  extraLang1Cluster && chunks.push(extraLang1Cluster)

  return chunks
}
