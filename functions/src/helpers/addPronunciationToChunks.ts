import { Language, Sentence } from "@/data/types/RawParagraph"
import { Chunk } from "@/views/doc/ChunkDisplay"
import { getLanguageForSentencesCallable } from "@/data/callable/functions"
import { getLanguageForSentences } from "@/functions/src/helpers/getLanguageForSentences"
import { isServerside } from "@/helpers/isServerside"
import pinyin from "pinyin" // Chinese pronunciation
// import Kuroshiro from "kuroshiro" // Japanese pronunciation
// import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji" // Japanese pronunciation
// const kuroshiro = new Kuroshiro()

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
  const getLanguageFunction1 = isServerside()
    ? () => Promise.resolve(getLanguageForSentences(chunks[0].lang1))
    : () =>
        getLanguageForSentencesCallable({ sentences: chunks[0].lang1 }).then(
          (_) => _.data as Chunk[]
        )
  const getLanguageFunction2 = isServerside()
    ? () => Promise.resolve(getLanguageForSentences(chunks[0].lang2))
    : () =>
        getLanguageForSentencesCallable({ sentences: chunks[0].lang2 }).then(
          (_) => _.data as Chunk[]
        )

  const lang1Language = getLanguageFunction1()
  const lang2Language = getLanguageFunction2()

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
