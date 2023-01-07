import { Language } from "@/data/types/RawParagraph"
import * as functions from "firebase-functions"
import { testData } from "./helpers/testData"
import { english, chinese } from "./helpers/hp"
import { fbSet } from "./helpers/writer"
import fetch from "node-fetch"
import wink from "wink-nlp"
import winkModel from "wink-eng-lite-web-model"
import { chunk } from "lodash"
import { generateRawParagraphKey } from "./helpers/generateRawParagraphKey"

const nlp = wink(winkModel)

// http://localhost:5011/xqchinese-325dd/us-central1/prepEmbedding

const sentSplitUrl =
  "https://sent-similarity-server-wjr62wruta-lz.a.run.app/split-sentences"

const embeddingsUrl =
  "https://sent-similarity-server-wjr62wruta-lz.a.run.app/encode-sentences"

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
  return (
    await (
      await fetch(sentSplitUrl, {
        method: "POST",
        body: JSON.stringify({
          texts: [text],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json()
  ).results
}

export const getSents = async (text: string) => {
  const clean = removeNewLines(text)
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")

  const textIsLatin = isLatin(clean)

  const results = await (textIsLatin
    ? Promise.resolve(nlp.readDoc(clean).sentences().out())
    : getSentsFromServer(clean).then((_) => _[0].sentences))

  const cleanResults = results.filter(Boolean)

  return cleanResults as string[]
}

export const getEmbeddings = async (sentences: string[]) => {
  const embeddingResp = await fetch(embeddingsUrl, {
    method: "POST",
    body: JSON.stringify({
      paragraphs: [sentences],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  const json = await embeddingResp.json()
  return json.results.embeddings[0] as number[][]
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
  return text.replace(/(\r\n|\n|\r)/gm, "")
}

const prepEmbeddingFn = async (lang1Text: string, lang2Text: string) => {
  const [lang1SentencesSplit, lang2SentencesSplit] = await Promise.all([
    getSents(lang1Text),
    getSents(lang2Text),
  ])

  const [
    lang1SentencesEmbeddings,
    lang2SentencesEmbeddings,
  ] = await Promise.all([
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
