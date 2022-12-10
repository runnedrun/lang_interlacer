import { EditableText } from "@/components/editable/EditableText"
import { buildEnumSelector } from "@/components/hoc/buildEnumSelector"
import { withPropsOverride } from "@/components/hoc/withPropsOverride"
import { AnyGenericModel } from "@/data/baseTypes/Model"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { isMobileObs } from "@/data/paramObsBuilders/isMobileObs"
import { settable } from "@/data/paramObsBuilders/settable"
import { objKeys } from "@/helpers/objKeys"
import { component } from "@/views/view_builder/component"
import { Button, Typography } from "@mui/material"
import React, { useMemo } from "react"
import { buildControlledEditableComponentFromObs } from "./buildControlledEditableComponentFromObs"
import { ViewType } from "./buildDataViewFromFieldDisplays"
import { DataViewOptions } from "./buildDocumentDisplayFromFieldDisplays"
import { CreateNewRowButton } from "./CreateNewRowButton"
import { DataControls } from "./DataControls"
import { MultiColumnActionList } from "./MultiColumnActionList"

export const buildHeaderComponent = (
  collectionName: string,
  searchTermObs: ParamaterizedObservable<any, string, any>,
  buildSearchResultsObs: (
    renderId
  ) => ParamaterizedObservable<any, AnyGenericModel[], any>,
  selectionObs: ParamaterizedObservable<any, string[], any>,
  viewSelectorObsFn: (renderId) => ParamaterizedObservable<any, ViewType, any>,
  options: DataViewOptions<any, any, any, any>
) => {
  const ViewSelectorControl = buildControlledEditableComponentFromObs(
    viewSelectorObsFn,
    "viewMode",
    buildEnumSelector(ViewType, {
      renderLabel: (_) => ViewType[_],
      inputLabel: "View Mode",
    })
  )

  const SearchBox = buildControlledEditableComponentFromObs(
    () => searchTermObs,
    "searchTerm",
    withPropsOverride(EditableText)({ placeholder: "Search" })
  )

  const searchableFields = options?.searchableFields

  return component(
    (renderId) => {
      return {
        data: buildSearchResultsObs(renderId),
        selection: selectionObs,
        isMobile: isMobileObs(),
        shouldShowFilters: settable("shouldShowFilters", false),
      }
    },
    ({
      isLoading,
      data,
      isMobile,
      selection,
      shouldShowFilters,
      setShouldShowFilters,
      ...controlsValuesAndSetters
    }) => {
      const getValuesByIds = (ids: string[]) =>
        data.filter((_) => ids.includes(_.uid))

      const getSelectedItems = useMemo(() => {
        return getValuesByIds(selection as string[])
      }, [selection])

      const CreateButton = useMemo(
        () =>
          options?.newItemFn
            ? withPropsOverride(CreateNewRowButton)({
                newItemFn: options.newItemFn,
              })
            : () => <div></div>,
        []
      )

      const showFiltersToggle = (
        <div onClick={() => setShouldShowFilters(!shouldShowFilters)}>
          <Typography className="text-primary-400 underline text-sm">
            {shouldShowFilters ? "Hide" : "Show"} Filters
          </Typography>
        </div>
      )

      const showingFilters = shouldShowFilters || !isMobile

      const sizedSearchBox = (
        <div className={showingFilters ? "w-48" : "w-full"}>
          <SearchBox></SearchBox>
        </div>
      )

      return (
        <div>
          <div className="flex flex-wrap items-center gap-4 px-4">
            {isMobile ? (
              <></>
            ) : (
              <div className="w-48">
                <ViewSelectorControl></ViewSelectorControl>
              </div>
            )}
            {searchableFields ? sizedSearchBox : <></>}
            {showingFilters && (
              <>
                <MultiColumnActionList
                  getSelectedItems={() => getSelectedItems}
                  actions={options.columnActions}
                  collectionName={collectionName}
                  selectionModel={selection}
                ></MultiColumnActionList>
                <DataControls
                  dataControlMap={options?.controls}
                  controlsValuesAndSetters={controlsValuesAndSetters}
                ></DataControls>
                <div>
                  <CreateButton />
                </div>
                {objKeys(options?.otherHeaderActions || {}).map((label) => {
                  const action = options.otherHeaderActions[label]
                  return (
                    <div key={label}>
                      <Button variant="outlined" onClick={action}>
                        {label}
                      </Button>
                    </div>
                  )
                })}
              </>
            )}
          </div>
          {isMobile && (
            <div className="w-full flex justify-center mt-5">
              {showFiltersToggle}
            </div>
          )}
        </div>
      )
    }
  ) as any
}
