import { Language, Sentence } from "@/data/types/RawParagraph"
import { getLanguageForSentences } from "@/functions/src/helpers/getLanguageForSentences"
import { Chunk } from "@/views/doc/ChunkDisplay"
import pinyin from "pinyin" // Chinese pronunciation
import Kuroshiro from "kuroshiro" // Japanese pronunciation
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji" // Japanese pronunciation

export const getPronunciationForSentences = async (
  lang: Language,
  sentences: Sentence[]
): Promise<Sentence[]> => {
  // Initialization for Japanese pronunciation
  let kuroshiro: Kuroshiro
  if (lang === Language.Japanese) {
    kuroshiro = new Kuroshiro()
    await kuroshiro.init(new KuromojiAnalyzer())
  }

  const pronunciationPromises = sentences
    .map(async (sentence) => {
      if (lang === Language.Chinese) {
        const pronunciationResults = pinyin(sentence.text, {
          group: true,
          segment: true,
        })

        const text = pronunciationResults.filter(Boolean).flat().join(" ")
        return { sentenceIndex: sentence.sentenceIndex, text } as Sentence
      } else if (lang === Language.Japanese) {
        const text = await kuroshiro.convert(sentence.text, {
          to: "hiragana",
          mode: "furigana",
        })

        return {
          sentenceIndex: sentence.sentenceIndex,
          text,
        } as Sentence
      } else {
        return null
      }
    })
    .filter(Boolean)

  const pronunciations = await Promise.all(pronunciationPromises)

  return pronunciations.length ? pronunciations : null
}

export type AddPronunciationToChunksInput = {
  chunks: Chunk[]
}

export type AddPronunciationToChunksOutput = Chunk[]

export const addPronunciationToChunks = ({
  chunks,
}: AddPronunciationToChunksInput): Promise<AddPronunciationToChunksOutput> => {
  const lang1Language = getLanguageForSentences(chunks[0].lang1)
  const lang2Language = getLanguageForSentences(chunks[0].lang2)

  const chunksWithPronunciationPromises = chunks.map(async (chunk) => {
    chunk.lang1Pronunciation = await getPronunciationForSentences(
      lang1Language,
      chunk.lang1
    )
    chunk.lang2Pronunciation = await getPronunciationForSentences(
      lang2Language,
      chunk.lang2
    )
    return chunk
  })

  const chunksWithPronunciations = Promise.all(chunksWithPronunciationPromises)

  return chunksWithPronunciations
}
