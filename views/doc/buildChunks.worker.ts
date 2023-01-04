// import * as md5 from "js-md5"
import { DocumentJobSettings } from "@/data/types/DocumentJob"
import { RawParagraph } from "@/data/types/RawParagraph"
import {
  ParamObsWorkerInput,
  ParamObsWorkerOutput,
  runWorkerForParamObs,
} from "@/page_helpers/admin/runWorkerForParamObs"
import { from, of } from "rxjs"
import { Chunk } from "./ChunkDisplay"
import { processChunks } from "./processChunks"

export type BuildChunksWorkerInputType = ParamObsWorkerInput<
  {
    lang1Paragraphs: RawParagraph[]
    lang2Paragraphs: RawParagraph[]
  },
  {}
>
export type BuildChunksWorkerOutputType = ParamObsWorkerOutput<Chunk[]>

runWorkerForParamObs<BuildChunksWorkerInputType, BuildChunksWorkerOutputType>(
  ({ cache, extraInputs: {}, value: { lang1Paragraphs, lang2Paragraphs } }) => {
    const chunks = of(processChunks(lang1Paragraphs, lang2Paragraphs))
    return chunks
  }
)
