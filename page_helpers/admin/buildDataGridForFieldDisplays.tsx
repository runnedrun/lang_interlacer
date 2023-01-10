import { AnyGenericModel, Model } from "@/data/baseTypes/Model"
import {
  FieldDisplayComponents,
  FieldTypeFromFieldDisplayComponents,
  ModelFromFieldDisplayComponents,
  SingleFieldEditableProps,
} from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { setters } from "@/data/fb"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { ValueTypeFromArrayParamObs } from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { ReadOnlyArg } from "@/data/paramObsBuilders/readonlySpecialArg"
import { FilterNotTypeConditionally } from "@/helpers/FilterTypeConditionally"
import { objKeys } from "@/helpers/objKeys"
import { component } from "@/views/view_builder/component"
import {
  DataGrid,
  GridCellEditStopReasons,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid"
import { cloneDeep, isEqual } from "lodash"
import { useRouter } from "next/router"
import React, { useMemo } from "react"
import { buildActionsCol } from "./buildActionsCol"
import { buildColumnDef } from "./buildColumnDef"
import { DocumentDisplayBuilder } from "./buildDocumentDisplayFromFieldDisplays"
import { ColumnTypes } from "./columnTypes"
import { isFieldDisplay } from "@/data/fieldDisplayComponents/isFieldDisplay"
import { updateHydratedValues } from "./updateHydratedValues"

export type FieldDisplay<
  FieldDisplayComponentsType extends FieldDisplayComponents<
    any,
    any
  > = FieldDisplayComponents<any, any>
> = {
  components: FieldDisplayComponentsType
  width?: number
  editable?: boolean
  type?: ColumnTypes
  valueForSort?: (args: {
    row: ModelFromFieldDisplayComponents<FieldDisplayComponentsType>
    value: FieldTypeFromFieldDisplayComponents<FieldDisplayComponentsType>
  }) => any
  hideComponent?: {
    tableDisplay?: {
      editable?: true
      all?: true
    }
    documentDisplay?: { editable?: true; all?: true; display?: true }
  }
}

export type FieldDisplays<
  FieldDisplayComponentsType extends FieldDisplayComponents<any, any>
> = Record<
  string,
  | FieldDisplay<FieldDisplayComponentsType>
  | GridColDef<
      ModelFromFieldDisplayComponents<FieldDisplayComponentsType>,
      FieldTypeFromFieldDisplayComponents<FieldDisplayComponentsType>
    >
>

const buildColumnDefs = <
  FieldDisplaySpecType extends FieldDisplayComponents<any, any>
>(
  displaySpecs: FieldDisplays<FieldDisplaySpecType>
) => {
  return objKeys(displaySpecs)
    .map((fieldName) => {
      const displaySpec = displaySpecs[fieldName]
      if (isFieldDisplay(displaySpec)) {
        return !displaySpec.hideComponent?.tableDisplay?.all
          ? buildColumnDef(fieldName, displaySpec)
          : null
      } else {
        return displaySpec
      }
    })
    .filter(Boolean)
}

const buildDataGridRowsAndCols =
  <FieldDisplaySpecType extends FieldDisplayComponents<any, any>>(
    adminDisplaySpecs: FieldDisplays<FieldDisplaySpecType>
  ) =>
  (data: ModelFromFieldDisplayComponents<FieldDisplaySpecType>[]) => {
    return {
      buildRows: () => {
        return data.map((model) => {
          return {
            ...model,
            id: model.uid,
          }
        })
      },
      buildCols: () => {
        return buildColumnDefs(adminDisplaySpecs)
      },
    }
  }

// type HydrationMapFromHydratedValue<
//   Value extends AnyGenericModel & { hydated?: any }
// > = Value extends GetHydratedValue<Value, infer HydrationMap>
//   ? HydrationMap
//   : {}

export type SingleEditableFieldComponent<FieldType extends any> =
  React.ComponentType<SingleFieldEditableProps<FieldType>>

export type ControlComponentsMapFromArgs<ArgsType extends Record<string, any>> =
  {
    [key in keyof FilterNotTypeConditionally<
      ArgsType,
      ReadOnlyArg<any>
    >]: SingleEditableFieldComponent<ArgsType[key]>
  }

export type FieldDisplayFromModel<ModelType extends Record<string, any>> =
  FieldDisplay<FieldDisplayComponents<Model<any, ModelType>, any>>

export type FieldDisplayFromRowsObservable<
  Obs extends ParamaterizedObservable<any, AnyGenericModel[], any>
> = FieldDisplays<
  FieldDisplayComponents<
    Model<any, {}> & Partial<ValueTypeFromArrayParamObs<Obs>>,
    any
  >
>

const DataGridHeader = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton
      onResize={() => {}}
      onResizeCapture={() => {}}
      nonce=""
    />
    {/* <GridToolbarExport /> */}
  </GridToolbarContainer>
)

export const buildDataGridForSpec: DocumentDisplayBuilder<{}> =
  (collectionNameForEdits, dataObsFn) =>
  (adminDisplaySpecs, options): React.ComponentType => {
    const buildRowsAndColsBuilders = buildDataGridRowsAndCols(adminDisplaySpecs)
    const finalDataObsFn = (id: string) => ({
      data: dataObsFn(id),
    })

    const GridComponent = component(
      finalDataObsFn,
      ({ isLoading, data, ...controlsValuesAndSetters }) => {
        const typed = data as unknown as ModelFromFieldDisplayComponents<
          FieldDisplayComponents<
            ValueTypeFromArrayParamObs<ReturnType<typeof dataObsFn>>,
            any
          >
        >[]

        const { buildCols, buildRows } = buildRowsAndColsBuilders(typed)

        const router = useRouter()

        const cols = useMemo(() => {
          const cols = buildCols()
          if (options.columnActions.length) {
            const columnActionsCol = buildActionsCol(
              collectionNameForEdits,
              options.columnActions,
              router
            )
            cols.push(columnActionsCol)
          }

          return cols
        }, [])

        const rows = buildRows()

        const initialStateSortObj = options?.defaultSort
          ? {
              sorting: {
                sortModel: [
                  {
                    field: options?.defaultSort.column,
                    sort: options?.defaultSort.direction,
                  },
                ],
              },
            }
          : {}

        return (
          <DataGrid
            loading={isLoading}
            components={{
              Toolbar: DataGridHeader,
            }}
            // componentsProps={componentProps}
            processRowUpdate={(row, oldRow) => {
              const oldClone = cloneDeep(oldRow)
              const newClone = cloneDeep(row)

              if (options.updateHydratedFields) {
                updateHydratedValues(
                  options.updateHydratedFields,
                  newClone,
                  oldClone
                )
              }

              delete (newClone as any).hydrated
              setters[collectionNameForEdits](row.uid, row as any)

              return row
            }}
            getRowHeight={() => "auto"}
            experimentalFeatures={{ newEditingApi: true }}
            rows={rows}
            columns={cols}
            checkboxSelection={true}
            disableSelectionOnClick
            onSelectionModelChange={(newSelectionModel) => {
              options?.onSelect(newSelectionModel.map((_) => String(_)))
            }}
            // selectionModel={selectionModel}
            onCellEditStop={(params, event) => {
              if (params.reason === GridCellEditStopReasons.enterKeyDown) {
                return (event.defaultMuiPrevented = true)
              }
            }}
            initialState={{ ...initialStateSortObj } as any}
            {...options}
            sx={{
              "& .MuiDataGrid-actionsCell": {
                display: "flex",
                flexWrap: "wrap",
              },
              "& .MuiDataGrid-cell": { p: "8px" },
            }}
          />
        )
      }
    )

    return GridComponent
  }
