export type FinalizedSentence = {
  text: string
  sentenceIndex: number
}

export type FinalizedChunk = {
  lang1: FinalizedSentence[]
  lang2: FinalizedSentence[]
  lang1Pronunciation?: FinalizedSentence[]
  lang2Pronunciation?: FinalizedSentence[]
}
