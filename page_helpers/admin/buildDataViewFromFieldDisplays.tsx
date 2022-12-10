import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { settable } from "@/data/paramObsBuilders/settable"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { component } from "@/views/view_builder/component"
import { Timestamp } from "@firebase/firestore"
import { clone } from "lodash"
import React from "react"
import { buildDataGridForSpec } from "./buildDataGridForFieldDisplays"
import { DocumentDisplayBuilder } from "./buildDocumentDisplayFromFieldDisplays"
import { buildHeaderComponent } from "./buildHeaderComponent"
import { buildOpenDocumentDisplayModalAndAction } from "./buildOpenDocumentDisplayModalAndAction"
import { buildPanelViewFromFieldDisplays } from "./buildPanelViewFromFieldDisplays"
import { buildSearch } from "./buildSearch"
import { viewModeObsWithMobileDefault } from "./viewModeObsWithMobileDefault"

export enum ViewType {
  Panel,
  "Data Grid",
}

const viewTypesToViewBuilders = {
  [ViewType.Panel]: buildPanelViewFromFieldDisplays,
  [ViewType["Data Grid"]]: buildDataGridForSpec,
}

const defaultViewSelectorObsFn = viewModeObsWithMobileDefault

export const buildDataViewFromAdminSpecs = (
  viewSelectorObsFn: (
    renderId: string
  ) => ParamaterizedObservable<{ viewMode: ViewType }, ViewType, any>
): DocumentDisplayBuilder<{}> => (collectionName, dataObsFn) => (
  adminDisplaySpecs,
  options
) => {
  const updateOptionsWithDefaultColumnActions = () => {
    const colActions = clone(options?.columnActions || [])

    !options?.hideDeleteAction &&
      colActions.unshift({
        label: "Archive",
        action: async ({ updateRow, currentData }) => {
          await (options.beforeDelete
            ? options.beforeDelete(currentData)
            : Promise.resolve())
          updateRow({
            archived: true,
            archivedOn: Timestamp.now(),
          } as Partial<CollectionModels[typeof collectionName]>)
        },
      })
    colActions.unshift({
      label: "Unarchive",
      action: ({ updateRow }) => {
        updateRow({
          archived: false,
        } as Partial<CollectionModels[typeof collectionName]>)
      },
      isAvailable: (row) => row.archived,
    })

    const {
      actionSpec: modalAction,
      ModalComponent,
    } = buildOpenDocumentDisplayModalAndAction(
      collectionName,
      dataObsFn
    )(adminDisplaySpecs, { ...options, columnActions: colActions })

    colActions.unshift(modalAction)

    return {
      options: { ...options, columnActions: colActions },
      ModalComponent,
    }
  }

  const selectionObs = settable("selection", [])

  const originalOnSelection = options.onSelect ? options.onSelect : () => {}
  const onSelect = (newSelection: string[]) => {
    originalOnSelection(newSelection)
    selectionObs.attach({ selection: newSelection })
  }

  options.onSelect = onSelect

  const searchTermObs = settable("searchTerm", null as string)

  const {
    options: optionsWithColActions,
    ModalComponent,
  } = updateOptionsWithDefaultColumnActions()

  const searchableFields = options?.searchableFields

  const buildSearchResultsObs = memoizeDataFunc((renderId: string) => {
    return (searchableFields
      ? buildSearch(dataObsFn(renderId), searchTermObs, {
          fieldsToSearchOn: searchableFields,
        })
      : dataObsFn(renderId)) as ReturnType<typeof dataObsFn>
  })

  const HeaderComponent = buildHeaderComponent(
    collectionName,
    searchTermObs,
    buildSearchResultsObs,
    selectionObs,
    viewSelectorObsFn,
    optionsWithColActions as any
  )

  const DataViewComponent = component(
    (renderId) => ({ selectedView: viewSelectorObsFn(renderId) }),
    ({ selectedView }) => {
      const Component = viewTypesToViewBuilders[selectedView](
        collectionName,
        buildSearchResultsObs
      )(adminDisplaySpecs, optionsWithColActions)
      return <Component />
    }
  )
  return () => (
    <div className="flex h-full flex-col">
      <ModalComponent />
      <div className="mb-4 mt-4">
        <HeaderComponent />
      </div>
      <div className="flex-grow overflow-auto">
        <DataViewComponent />
      </div>
    </div>
  )
}

export const builDefaultDataViewFromFieldDisplays: DocumentDisplayBuilder<{}> = (
  ...args
) => (...args2) => {
  return buildDataViewFromAdminSpecs(defaultViewSelectorObsFn)(...args)(
    ...args2
  )
}
