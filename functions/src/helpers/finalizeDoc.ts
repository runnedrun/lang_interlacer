import { FinalizedChunk, FinalizedSentence } from "@/data/types/FinalizedChunk"
import { RawParagraph } from "@/data/types/RawParagraph"
import { buildChunksFromEmbeddings } from "@/views/doc/buildChunksFromEmbeddings"
import { addPronunciationToChunks } from "./addPronunciationToChunks"
import { paginatedMapper } from "./paginatedMapper"

type FinalizeDocOptions = {
  includePronunciation?: boolean
}

export const finalizeDoc = async (
  docKey: string,
  { includePronunciation }: FinalizeDocOptions
) => {
  const lang1Paragraphs = [] as RawParagraph[]
  const lang2Paragraphs = [] as RawParagraph[]
  await paginatedMapper(
    {
      collectionName: "rawParagraph",
      buildQuery: (ref) => {
        return ref.where("docKey", "==", docKey).orderBy("chunkIndex")
      },
    },
    async (snapshot) => {
      const data = snapshot.data()
      if (data.language === "1") {
        lang1Paragraphs.push(data)
      } else {
        lang2Paragraphs.push(data)
      }
      return null
    }
  )

  const chunks = buildChunksFromEmbeddings(lang1Paragraphs, lang2Paragraphs)
  const cleanChunks = chunks.map((chunk) => {
    const cleanLang1 = chunk.lang1.map((sentence) => {
      delete sentence.embedding
      return sentence as FinalizedSentence
    })
    const cleanLang2 = chunk.lang2.map((sentence) => {
      delete sentence.embedding
      return sentence as FinalizedSentence
    })
    delete chunk.score
    return { ...chunk, lang1: cleanLang1, lang2: cleanLang2 } as FinalizedChunk
  })

  const withPronunciation = includePronunciation
    ? await addPronunciationToChunks({ chunks: cleanChunks })
    : chunks

  return withPronunciation
}
