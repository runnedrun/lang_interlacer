import { Language } from "@/data/types/RawParagraph"
import { Chunk } from "@/views/doc/ChunkDisplay"
import * as functions from "firebase-functions"
import pinyin from "pinyin"
import { addPronunciationToChunks } from "../helpers/addPronunciationToChunks"

export type AddPronunciationToChunksInput = {
  chunks: Chunk[]
}

export const addPronunciationToChunksCallable = functions.https.onCall(
  async (data, context) => {
    const { chunks } = data as AddPronunciationToChunksInput
    return addPronunciationToChunks(chunks)
  }
)
