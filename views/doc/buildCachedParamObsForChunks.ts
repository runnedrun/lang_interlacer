import {
  HydrationWorkerInputType,
  HydrationWorkerOutputType,
} from "@/data/firebaseObsBuilders/hydration.worker"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { combine } from "@/data/paramObsBuilders/combine"
import { RawParagraph } from "@/data/types/RawParagraph"
import { useWorkerForParamObs } from "@/page_helpers/admin/useWorkerForParamObs"
import { of } from "rxjs"
import { buildChunks } from "./buildChunks"
import {
  BuildChunksWorkerInputType,
  BuildChunksWorkerOutputType,
} from "./buildChunks.worker"

export const buildCachedParamObsForChunks = <ArgType, NameType extends string>(
  lang1ParagraphsObs: ParamaterizedObservable<
    ArgType,
    RawParagraph[],
    NameType
  >,
  lang2ParagraphsObs: ParamaterizedObservable<ArgType, RawParagraph[], NameType>
) => {
  const combined = combine(
    {
      lang1Paragraphs: lang1ParagraphsObs,
      lang2Paragraphs: lang2ParagraphsObs,
    },
    "chunks"
  )

  return useWorkerForParamObs<
    ParamaterizedObservable<
      any,
      { lang1Paragraphs: RawParagraph[]; lang2Paragraphs: RawParagraph[] },
      any
    >,
    BuildChunksWorkerInputType,
    BuildChunksWorkerOutputType
  >(
    combined,
    () => new Worker(new URL("./buildChunks.worker.ts", import.meta.url)),
    {},
    (values) => {
      return of(buildChunks(values.lang1Paragraphs, values.lang2Paragraphs))
    }
  ).cloneWithCaching()
}
