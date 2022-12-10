import { Language } from "@/data/types/RawParagraph"
import { Paragraph } from "@/pages/doc/[docKey]"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { testData } from "./helpers/testData"
import { fbSet } from "./helpers/writer"
import fetch from "node-fetch"

// export const example = functions.firestore
//   .document("themeGenImageJobs/{docId}")
//   .onCreate((change) => {
//     const firestore = getFirestore()
//   })

const sentSplitUrl =
  "https://runnedrun-didactic-eureka-xgr9w667rc6x96-5000.preview.app.github.dev/split-sentences"

const embeddingsUrl =
  "https://runnedrun-didactic-eureka-xgr9w667rc6x96-5000.preview.app.github.dev/encode-sentences"

const getSents = async () => {
  const [enSentencesSplitResp, zhSentencesSplitResp] = await Promise.all([
    fetch(sentSplitUrl, {
      method: "POST",
      body: JSON.stringify({
        texts: testData.englishParagraphs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    fetch(sentSplitUrl, {
      method: "POST",
      body: JSON.stringify({
        texts: testData.chineseParagraphs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  ])
  return [await enSentencesSplitResp.json(), await zhSentencesSplitResp.json()]
}

const getEmbeddings = async (
  enParagraphs: string[][],
  zhParagraphs: string[][]
) => {
  const [enSentencesSplitResp, zhSentencesSplitResp] = await Promise.all([
    fetch(embeddingsUrl, {
      method: "POST",
      body: JSON.stringify({
        paragraphs: enParagraphs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    fetch(embeddingsUrl, {
      method: "POST",
      body: JSON.stringify({
        paragraphs: zhParagraphs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  ])

  return [await enSentencesSplitResp.json(), await zhSentencesSplitResp.json()]
}

const docKey = "nyt-1"

const saveEmbeddingsAndParagraphs = async (
  paragraphs: Paragraph[],
  embeddings: number[][][],
  language: Language
) => {
  await Promise.all(
    paragraphs.map((paragraph, i) => {
      const sentences = paragraph.sentences
      const sentencesWithEmebeddings = sentences.map((sentence, j) => {
        return {
          text: sentence,
          embedding: embeddings[i][j],
        }
      })
      return fbSet("rawParagraph", `${docKey}-${language}-${i}`, {
        sentences: sentencesWithEmebeddings,
        docKey,
        language: language,
      })
    })
  )
}

export const prepEmbedding = functions.https.onRequest(async (req, res) => {
  const [enSentencesSplit, zhSentencesSplit] = await getSents()
  const enParagraphs = enSentencesSplit.results as Paragraph[]
  const zhParagraphs = zhSentencesSplit.results as Paragraph[]

  const [enSentencesEmbeddings, zhSentencesEmbeddings] = await getEmbeddings(
    enParagraphs.map((_) => _.sentences),
    zhParagraphs.map((_) => _.sentences)
  )

  const enEmbeddings = enSentencesEmbeddings.results.embeddings as number[][][]
  const zhEmbeddings = zhSentencesEmbeddings.results.embeddings as number[][][]

  await Promise.all([
    saveEmbeddingsAndParagraphs(enParagraphs, enEmbeddings, "en"),
    saveEmbeddingsAndParagraphs(zhParagraphs, zhEmbeddings, "zh"),
  ])

  res.send("done")
})
