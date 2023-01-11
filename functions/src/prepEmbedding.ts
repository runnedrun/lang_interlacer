import * as functions from "firebase-functions"
import batchPromises from "batch-promises"
import { chunk } from "lodash"
import fetch from "node-fetch"
import winkModel from "wink-eng-lite-web-model"
import wink from "wink-nlp"
import { generateRawParagraphKey } from "./helpers/generateRawParagraphKey"
import { chinese, english } from "./helpers/hp"
import { fbSet } from "./helpers/writer"
import axios from "axios"
import axiosRetry from "axios-retry"

console.log("USING AXIOS RETRY")
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    console.log("CHECKING FOR RETRY", error.status)
    return true
  },
  onRetry: (error) => {
    console.log("RETRYGIN!")
  },
})

const nlp = wink(winkModel)

// http://localhost:5011/xqchinese-325dd/us-central1/prepEmbedding

const sentSplitUrl =
  "https://sent-similarity-server-b5j4e5pysa-uc.a.run.app/split-sentences"

const embeddingsUrl =
  "https://sent-similarity-server-b5j4e5pysa-uc.a.run.app/encode-sentences"

// const sentSplitUrl =
//   "https://runnedrun-didactic-eureka-xgr9w667rc6x96-5000.preview.app.github.dev/split-sentences"

// const embeddingsUrl =
//   "https://runnedrun-didactic-eureka-xgr9w667rc6x96-5000.preview.app.github.dev/encode-sentences"

type Paragraph = {
  sentences: string[]
}

const isLatin = (text: string) => {
  const firstSample = text.slice(0, 1000)
  const res = firstSample.match(/[a-zA-Z0-9-]/g)
  const numberOfLatinChars = res ? res.length : 0
  const percLatin = numberOfLatinChars / firstSample.length
  return percLatin > 0.5
}

const getSentsFromServer = async (text: string) => {
  const resp = await axios.post(sentSplitUrl, {
    texts: [text],
  })

  return resp.data.results
}
const MAX_SENTENCE_LENGTH = 500
const backUpSplitSentences = (sentences: string[]) => {
  const backupSplitted = sentences.map((sentence) => {
    if (sentence.length > MAX_SENTENCE_LENGTH) {
      const splitted = sentence.split(/.。/g)
      const finalSplit = splitted
        .map((sentence) => {
          if (sentence.length > MAX_SENTENCE_LENGTH) {
            return chunk(sentence, MAX_SENTENCE_LENGTH).map((chunk) =>
              chunk.join("")
            )
          } else {
            return sentence
          }
        })
        .flat()
      return finalSplit
    } else {
      return [sentence]
    }
  })
  return backupSplitted.flat()
}

export const getSents = async (text: string) => {
  const clean = removeNewLines(text)
    .replace(/&quot;/g, '"')
    .replace(/“/g, '"')
    .replace(/\s{2,}/g, " ")

  const textIsLatin = isLatin(clean)

  const results = await (textIsLatin
    ? Promise.resolve(nlp.readDoc(clean).sentences().out())
    : getSentsFromServer(clean).then((_) => _[0].sentences))

  const cleanResults = backUpSplitSentences(results.filter(Boolean))

  return cleanResults as string[]
}

export const getEmbeddings = async (sentences: string[]) => {
  const chunked = chunk(sentences, 150)
  const allChunkResults = []
  await batchPromises(
    2,
    Array.from(chunked.entries()),
    async ([i, chunk]: [number, string[]]) => {
      console.log("running batch ", i, " of ", chunked.length)

      const embeddingResp = await axios.post(embeddingsUrl, {
        paragraphs: [chunk],
      })

      const json = embeddingResp.data
      const results = json.results.embeddings as number[][]
      allChunkResults[i] = results
      console.log("batch complet1e", i)
    }
  )
  console.log("FINISHED EMBEDDINGS for", chunked.length, "chunks")
  return allChunkResults.flat()
}

const docKey = "hp-2"

export const saveEmbeddingsAndParagraphs = async (
  sentences: string[],
  embeddings: number[][],
  languageId: string,
  docKey: string
) => {
  const chunked = chunk(sentences, 10)
  return await Promise.all(
    chunked.map((sentences, chunkIndex) => {
      const sentencesWithEmebeddings = sentences.map((sentence, i) => {
        const sentenceIndex = chunkIndex * 10 + i
        return {
          text: sentence,
          embedding: embeddings[sentenceIndex],
          sentenceIndex,
        }
      })
      return fbSet(
        "rawParagraph",
        generateRawParagraphKey(docKey, languageId, chunkIndex),
        {
          sentences: sentencesWithEmebeddings,
          docKey,
          language: languageId,
          chunkIndex,
        }
      )
    })
  )
}

const removeNewLines = (text: string) => {
  return text.replace(/(\r\n|\n|\r)/gm, " ")
}

const prepEmbeddingFn = async (lang1Text: string, lang2Text: string) => {
  const [lang1SentencesSplit, lang2SentencesSplit] = await Promise.all([
    getSents(lang1Text),
    getSents(lang2Text),
  ])

  const [lang1SentencesEmbeddings, lang2SentencesEmbeddings] =
    await Promise.all([
      getEmbeddings(lang1SentencesSplit),
      getEmbeddings(lang2SentencesSplit),
    ])

  await Promise.all([
    saveEmbeddingsAndParagraphs(
      lang1SentencesSplit,
      lang1SentencesEmbeddings,
      "1",
      docKey
    ),
    saveEmbeddingsAndParagraphs(
      lang2SentencesSplit,
      lang2SentencesEmbeddings,
      "2",
      docKey
    ),
  ])
}

export const prepEmbedding = functions.https.onRequest(async (req, res) => {
  await prepEmbeddingFn(english, chinese)
  res.send("done")
})
