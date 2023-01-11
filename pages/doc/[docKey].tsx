import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { buildCachedParamObsForChunks } from "@/views/doc/buildCachedParamObsForChunks"
import { ChunksDisplay } from "@/views/doc/ChunksDisplay"
import { DocPreviewHeader } from "@/views/doc/DocPreviewHeader"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { OrderByDirection } from "@firebase/firestore"
import { CircularProgress } from "@mui/material"
import { Language } from "@/data/types/RawParagraph"
import { getLanguageForSentences } from "@/functions/src/helpers/getLanguageForSentences"
import React from "react"
import { map } from "rxjs"
import ErrorPage from "next/error"

const dataFunc = memoizeDataFunc((renderId: string) => {
  const param = stringParam("docKey", undefined as ForeignKey<"documentJob">)

  const chunksObs = buildCachedParamObsForChunks(
    filtered(
      "rawParagraph",
      {
        docKey: param,
        language: staticValue("1"),
      },
      {
        orderBy: {
          chunkIndex: staticValue("asc" as OrderByDirection),
        },
        limit: staticValue(10),
      }
    ),
    filtered(
      "rawParagraph",
      {
        docKey: param,
        language: staticValue("2"),
      },
      {
        orderBy: {
          chunkIndex: staticValue("asc" as OrderByDirection),
        },
        limit: staticValue(10),
      }
    ),
    docForKey("documentJob", param).pipe(
      map((_) => {
        return _?.settings || {}
      })
    )
  )

  return {
    docKey: param,
    chunks: chunksObs,
  }
})

export type SelectedSentence = {
  langId: string
  index: number
  emedding: number[]
}

export const compareSelections = (
  selectionSentences: SelectedSentence[],
  comparingSetence: SelectedSentence
) => {
  return selectionSentences.some((selection) => {
    return (
      selection?.langId === comparingSetence?.langId &&
      selection?.index === comparingSetence?.index
    )
  })
}

console.log("test")

const DocDisplay = component(dataFunc, ({ chunks, docKey, isLoading }) => {
  if (!chunks) {
    return <ErrorPage statusCode={404}></ErrorPage>
  }

  const languages: Language[] = [
    getLanguageForSentences(chunks[0].lang1),
    getLanguageForSentences(chunks[0].lang2),
  ]

  return (
    <div className="mt-5 flex w-full justify-center">
      {isLoading && (
        <div className="absolute flex h-screen w-screen items-center justify-center">
          <CircularProgress size="4rem" />
        </div>
      )}
      <div className="flex h-screen max-w-2xl flex-col px-5 md:w-2/3 md:p-0">
        <DocPreviewHeader docKey={docKey} languages={languages} />
        <div className="overflow-auto">
          <ChunksDisplay chunks={chunks} />
        </div>
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default DocDisplay
