import { DocumentJob } from "@/data/types/DocumentJob"
import * as functions from "firebase-functions"
import { paginatedMapper } from "../helpers/paginatedMapper"
import epub from "epub-gen-memory"
import { finalizeDoc } from "../helpers/finalizeDoc"
import admin from "firebase-admin"
import { fbSet } from "../helpers/writer"
import { FinalizedSentence } from "@/data/types/FinalizedChunk"
import { Timestamp } from "firebase-admin/firestore"

const joinSentences = (sentences: FinalizedSentence[]) =>
  sentences
    .map((_) => _?.text)
    .filter(Boolean)
    .join(" ")

export const triggerEpubCreationForDocJob = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "4GB",
  })
  .firestore.document("documentJob/{docId}")
  .onWrite(async (change) => {
    const before = change.before?.data() as DocumentJob
    const after = change.after?.data() as DocumentJob
    const docId = change.after?.id

    const lastJobTimestamp = new Timestamp(
      before?.triggerEpubCreation?.seconds || 0,
      before?.triggerEpubCreation?.nanoseconds || 0
    )

    const currentJobTimestamp = new Timestamp(
      after.triggerEpubCreation?.seconds || 0,
      after.triggerEpubCreation?.nanoseconds || 0
    )

    const jobNotStarted = currentJobTimestamp.isEqual(lastJobTimestamp)

    if (jobNotStarted || !after) {
      return
    }

    const finalizedChunks = await finalizeDoc(docId, {
      includePronunciation: after.settings?.showPronunciation,
    })
    console.log("final  chunks", finalizedChunks.length)

    const sectionsForBook = finalizedChunks.map((chunk) => {
      const pronunciationEl = chunk.lang1Pronunciation
        ? `<div class="pinyin">${joinSentences(chunk.lang1Pronunciation)}</div>`
        : ""

      const lang1El = `<div class="english">${joinSentences(
        chunk.lang2
      )}.</div>`
      const lang2El = `<div class="hanzi">${joinSentences(chunk.lang1)}.</div>`

      return `<div class="pinyinAndEnglish">${pronunciationEl}${lang1El}${lang2El}</div>`
    })
    const allHtml = sectionsForBook.join("</br>")

    const options = {
      title: "XQ Chinese: Harry Potter", // *Required, title of the book.
      author: "JK Rowling", // *Required, name of the author.
      // cover: "fb_functions/books/cover.jpeg",
    }

    const filename = `${docId}.epub`

    const epubBuffer = await epub(options, [
      { content: `<div>${allHtml}</div>` },
    ])

    const bucket = admin.storage().bucket()
    const file = bucket.file(`generated-epubs/${filename}`)
    await file.save(epubBuffer, {
      validation: false,
      contentType: "application/epub+zip",
    })

    const url = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 3 * 12 * 60 * 60 * 1000,
    })

    console.log("url", url)

    await fbSet("documentJob", docId, {
      epubFile: {
        url: url[0],
        name: filename,
      },
    })
  })
