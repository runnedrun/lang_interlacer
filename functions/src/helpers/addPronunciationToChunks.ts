import { Language, Sentence } from "@/data/types/RawParagraph"
import { objKeys } from "@/helpers/objKeys"
import { Chunk } from "@/views/doc/ChunkDisplay"
import pinyin from "pinyin"

const isChinese = (text: string) => {
  const re = /[\u4e00-\u9fa5]/
  return re.test(text)
}

const isJapanese = (text: string) => {
  const re = /[\u3040-\u309f]/
  return re.test(text)
}

const languageCheckers = {
  [Language.Japanese]: isJapanese,
  [Language.Chinese]: isChinese,
}

const getLanguageForSentences = (sentences: Sentence[]) => {
  const firstSentence = sentences[0]
  return objKeys(languageCheckers).find((lang) => {
    const checker = languageCheckers[lang]
    return checker(firstSentence.text)
  })
}

const getPronunciationForSentences = (
  lang: Language,
  sentences: Sentence[]
) => {
  const pronunciations = sentences
    .map((sentence) => {
      if (lang === Language.Chinese) {
        const text = pinyin(sentence.text, {
          group: true,
          segment: true,
        })
          .flat()
          .join(" ")
        return { sentenceIndex: sentence.sentenceIndex, text } as Sentence
      } else {
        return null
      }
    })
    .filter(Boolean)

  return pronunciations.length ? pronunciations : null
}

export const addPronunciationToChunks = (chunks: Chunk[]) => {
  const lang1Language = getLanguageForSentences(chunks[0].lang1)
  const lang2Language = getLanguageForSentences(chunks[0].lang2)

  const chunksWithPronunciations = chunks.map((chunk) => {
    chunk.lang1Pronunciation = getPronunciationForSentences(
      lang1Language,
      chunk.lang1
    )
    chunk.lang2Pronunciation = getPronunciationForSentences(
      lang2Language,
      chunk.lang2
    )
    return chunk
  })
  console.log("with pronunc", chunksWithPronunciations)

  return chunksWithPronunciations
}
