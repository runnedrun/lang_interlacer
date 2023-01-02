import {
  HydrationWorkerInputType,
  HydrationWorkerOutputType,
} from "@/data/firebaseObsBuilders/hydration.worker"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { combine } from "@/data/paramObsBuilders/combine"
import { RawParagraph } from "@/data/types/RawParagraph"
import { useWorkerForParamObs } from "@/page_helpers/admin/useWorkerForParamObs"
import { from, of } from "rxjs"
import { buildChunksFromEmbeddings } from "./buildChunksFromEmbeddings"
import {
  BuildChunksWorkerInputType,
  BuildChunksWorkerOutputType,
} from "./buildChunks.worker"
import { DocumentJobSettings } from "@/data/types/DocumentJob"
import { processChunks } from "./processChunks"
import { logObs } from "@/helpers/logObs"

export const buildCachedParamObsForChunks = <ArgType, NameType extends string>(
  lang1ParagraphsObs: ParamaterizedObservable<
    ArgType,
    RawParagraph[],
    NameType
  >,
  lang2ParagraphsObs: ParamaterizedObservable<
    ArgType,
    RawParagraph[],
    NameType
  >,
  settingsObs: ParamaterizedObservable<any, DocumentJobSettings, any>
) => {
  const combined = combine(
    {
      lang1Paragraphs: lang1ParagraphsObs,
      lang2Paragraphs: lang2ParagraphsObs,
      options: settingsObs,
    },
    "chunks",
    true
  )

  return useWorkerForParamObs<
    ParamaterizedObservable<
      any,
      {
        lang1Paragraphs: RawParagraph[]
        lang2Paragraphs: RawParagraph[]
        options: DocumentJobSettings
      },
      any
    >,
    BuildChunksWorkerInputType,
    BuildChunksWorkerOutputType
  >(
    combined,
    () => new Worker(new URL("./buildChunks.worker.ts", import.meta.url)),
    {},
    (values) => {
      return from(
        processChunks(
          values.lang1Paragraphs,
          values.lang2Paragraphs,
          values.options
        )
      )
    }
  ).cloneWithCaching()
}
