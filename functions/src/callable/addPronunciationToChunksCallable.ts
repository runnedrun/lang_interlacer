import { Language } from "@/data/types/RawParagraph"
import { Chunk } from "@/views/doc/ChunkDisplay"
import * as functions from "firebase-functions"
import pinyin from "pinyin"
import {
  addPronunciationToChunks,
  AddPronunciationToChunksInput,
} from "../helpers/addPronunciationToChunks"

export const addPronunciationToChunksCallable = functions.https.onCall(
  async (data, context) => {
    return addPronunciationToChunks(data as AddPronunciationToChunksInput)
  }
)
