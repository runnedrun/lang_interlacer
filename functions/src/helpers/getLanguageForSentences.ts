import { FinalizedSentence } from "@/data/types/FinalizedChunk"
import { Language } from "@/data/types/RawParagraph"
import { objKeys } from "@/helpers/objKeys"

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

export function getLanguageForSentences(
  sentences: FinalizedSentence[]
): Language {
  const firstSentence = sentences[0]
  return objKeys(languageCheckers).find((lang) => {
    const checker = languageCheckers[lang]
    return checker(firstSentence.text)
  })
}
