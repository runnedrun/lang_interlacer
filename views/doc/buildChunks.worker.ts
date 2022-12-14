// import * as md5 from "js-md5"
import { RawParagraph } from "@/data/types/RawParagraph"
import {
  ParamObsWorkerInput,
  ParamObsWorkerOutput,
  runWorkerForParamObs,
} from "@/page_helpers/admin/runWorkerForParamObs"
import { BehaviorSubject, combineLatest, of } from "rxjs"
import { buildChunks } from "./buildChunks"
import { Chunk } from "./ChunkDisplay"

export type BuildChunksWorkerInputType = ParamObsWorkerInput<
  { lang1Paragraphs: RawParagraph[]; lang2Paragraphs: RawParagraph[] },
  {}
>
export type BuildChunksWorkerOutputType = ParamObsWorkerOutput<Chunk[]>

runWorkerForParamObs<BuildChunksWorkerInputType, BuildChunksWorkerOutputType>(
  ({ cache, extraInputs: {}, value: { lang1Paragraphs, lang2Paragraphs } }) => {
    return of(buildChunks(lang1Paragraphs, lang2Paragraphs))
  }
)
