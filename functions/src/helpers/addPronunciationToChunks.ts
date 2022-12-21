import { Language, Sentence } from "@/data/types/RawParagraph"
import { objKeys } from "@/helpers/objKeys"
import { Chunk } from "@/views/doc/ChunkDisplay"
import pinyin from "pinyin" // Chinese pronunciation
// import Kuroshiro from "kuroshiro" // Japanese pronunciation
// import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji" // Japanese pronunciation
// const kuroshiro = new Kuroshiro()

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
        const pronunciationResults = pinyin(sentence.text, {
          group: true,
          segment: true,
        })

        const text = pronunciationResults.filter(Boolean).flat().join(" ")
        return { sentenceIndex: sentence.sentenceIndex, text } as Sentence
      } else if (lang === Language.Japanese) {
        // const text = await kuroshiro.convert(sentence.text, {
        //   to: "hiragana",
        //   mode: "normal",
        // })

        // return { sentenceIndex: sentence.sentenceIndex, text } as Sentence
        console.log("Got Japanese pronunciation for the sentence")
        return null
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

  if (lang1Language === Language.Japanese) {
    // await kuroshiro.init(new KuromojiAnalyzer())
    console.log("The text is Japanese!")
  }

  const chunksWithPronunciations = chunks.map(async (chunk) => {
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

  return chunksWithPronunciations
}
