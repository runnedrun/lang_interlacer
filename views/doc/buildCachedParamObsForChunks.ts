import {
  HydrationWorkerInputType,
  HydrationWorkerOutputType,
} from "@/data/firebaseObsBuilders/hydration.worker"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { combine } from "@/data/paramObsBuilders/combine"
import { RawParagraph } from "@/data/types/RawParagraph"
import { useWorkerForParamObs } from "@/page_helpers/admin/useWorkerForParamObs"
import { from, of, shareReplay, switchMap } from "rxjs"
import { buildChunksFromEmbeddings } from "./buildChunksFromEmbeddings"
import {
  BuildChunksWorkerInputType,
  BuildChunksWorkerOutputType,
} from "./buildChunks.worker"
import { DocumentJobSettings } from "@/data/types/DocumentJob"
import { processChunks } from "./processChunks"
import { logObs } from "@/helpers/logObs"
import { isServerside } from "@/helpers/isServerside"
import { addPronunciationToChunksCallable } from "@/data/callable/functions"
import { Chunk } from "./ChunkDisplay"

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
): ParamaterizedObservable<ArgType, Chunk[], any> => {
  const combined = combine(
    {
      lang1Paragraphs: lang1ParagraphsObs,
      lang2Paragraphs: lang2ParagraphsObs,
    },
    "chunks",
    true
  )

  const interlacedChunksObs = useWorkerForParamObs<
    ParamaterizedObservable<
      any,
      {
        lang1Paragraphs: RawParagraph[]
        lang2Paragraphs: RawParagraph[]
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
      return of(
        processChunks(
          values.lang1Paragraphs,
          values.lang2Paragraphs
          // Question for David: how can I get the matchLength from settingsObs?
          // settingsObs.matchLength
        )
      )
    }
  )

  return combine(
    {
      interlacedChunks: interlacedChunksObs,
      settings: settingsObs,
    },
    "chunksAndSettings"
  )
    .pipe(
      switchMap(({ interlacedChunks, settings }) => {
        return settings.showPronunciation
          ? from(
              addPronunciationToChunksCallable({
                chunks: interlacedChunks,
              }) as Promise<Chunk[]>
            )
          : of(interlacedChunks)
      })
    )
    .pipeWithLoading(shareReplay({ bufferSize: 1, refCount: true }))
    .cloneWithCaching()
}
