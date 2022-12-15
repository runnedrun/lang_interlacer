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
          chunkIndex: staticValue("desc" as OrderByDirection),
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
          chunkIndex: staticValue("desc" as OrderByDirection),
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

const DocDisplay = component(dataFunc, ({ chunks, docKey, isLoading }) => {
  if (!chunks) {
    return <ErrorPage statusCode={404}></ErrorPage>
  }

  return (
    <div className="w-full flex justify-center mt-5">
      {isLoading && (
        <div className="absolute h-screen w-screen flex justify-center items-center">
          <CircularProgress size="4rem" />
        </div>
      )}
      <div className="md:w-2/3 md:p-0 max-w-2xl px-5 h-screen flex flex-col">
        <DocPreviewHeader docKey={docKey} />
        <div className="overflow-auto">
          <ChunksDisplay chunks={chunks} />
        </div>
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default DocDisplay
