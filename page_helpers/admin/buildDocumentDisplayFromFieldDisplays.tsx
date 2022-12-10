import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { AnyGenericModel } from "@/data/baseTypes/Model"
import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { isFieldDisplay } from "@/data/fieldDisplayComponents/isFieldDisplay"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { EditingState, fbWriter } from "@/data/firebaseObsBuilders/fbWriter"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  ValueTypeFromArrayParamObs,
} from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { prop } from "@/data/paramObsBuilders/prop"
import { settable } from "@/data/paramObsBuilders/settable"
import { CountdownType } from "@/helpers/countdownType"
import { objKeys } from "@/helpers/objKeys"
import { component } from "@/views/view_builder/component"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { Box, Button } from "@mui/material"
import { clone } from "lodash"
import { useRouter } from "next/router"
import React from "react"
import { UnionToIntersection, ValuesType } from "utility-types"
import { buildActionButtonFromSpec } from "./buildActionButtonFromSpec"
import {
  getDisplayComponentForFieldDisplay,
  getEditableComponentForFieldDisplay,
} from "./buildColumnDef"
import {
  ControlComponentsMapFromArgs,
  FieldDisplayFromRowsObservable,
  FieldDisplays,
} from "./buildDataGridForFieldDisplays"
import { PossibleSearchKeys } from "./buildSearch"
import {
  ColumnActionSpec,
  MultiColumnActionList,
} from "./MultiColumnActionList"
import { updateHydratedValues } from "./updateHydratedValues"

export type RenderComponentFn = (args: {
  editMode: boolean
  fieldName: string
  fieldComponent: React.ReactNode
}) => React.ReactNode

export type HydrationMapFromModelType<
  ModelType extends AnyGenericModel & {
    hydrated?: Record<string, any>
  },
  Prefix extends string = "",
  I extends number = 5
> = [I] extends [never]
  ? never
  : UnionToIntersection<
      ValuesType<
        {
          [key in Extract<
            keyof ModelType["hydrated"],
            string
          >]: ModelType[key] extends ForeignKey<infer CollectioName>
            ? { [key2 in key as `${Prefix}${key2}`]: CollectioName } &
                HydrationMapFromModelType<
                  ModelType["hydrated"][key],
                  `${Prefix}${key}.`,
                  CountdownType[I]
                >
            : {}
        }
      >
    >

type ViewTypeSpecificProps<ColumnNames extends string | number | symbol> = {}

export type DocumentDisplayRenderFn<
  ColumnNames extends string | number | symbol
> = (args: {
  components: Record<ColumnNames, React.ReactNode>
  editMode: boolean
}) => React.ReactElement

type SingleDocumentDisplayOptions<
  CollectionName extends keyof CollectionModels,
  RowType extends AnyGenericModel,
  ColumnNames extends string | number | symbol
> = {
  documentDisplay?: {
    startEditing?: boolean
  }
  hideDeleteAction?: boolean
  renderDocument?: DocumentDisplayRenderFn<ColumnNames>
  columnActions?: ColumnActionSpec<CollectionName, RowType>[]
  updateHydratedFields?: Partial<HydrationMapFromModelType<RowType>>
  beforeDelete?: (row: RowType) => Promise<any>
}

export type DataViewOptions<
  CollectionName extends keyof CollectionModels,
  RowType extends AnyGenericModel,
  PossibleControlComponents extends Record<
    string,
    React.ComponentType<SingleFieldEditableProps<any>>
  >,
  ColumnNames extends string | number | symbol
> = {
  controls?: PossibleControlComponents
  newItemFn?: () => Promise<any>
  otherHeaderActions?: Record<string, () => void>
  defaultSort?: { column: ColumnNames; direction: "asc" | "desc" }
  onSelect?: (newSelection: string[]) => void
  searchableFields?: PossibleSearchKeys<RowType>[]
} & SingleDocumentDisplayOptions<CollectionName, RowType, ColumnNames> &
  ViewTypeSpecificProps<ColumnNames>

export const defaultRenderFieldComponent: RenderComponentFn = ({
  fieldComponent,
  editMode,
  fieldName,
}) => {
  return (
    <div key={fieldName}>
      <div className="mb-1 text-sm font-bold">{fieldName}</div>
      <Box className="px-1" sx={{ minHeight: 30 }}>
        {fieldComponent}
      </Box>
    </div>
  )
}

const defaultRenderDocument: DocumentDisplayRenderFn<any> = ({
  components,
  editMode,
}) => {
  const renderedComponents = Object.entries(components).map(([key, value]) => {
    return defaultRenderFieldComponent({
      fieldName: key,
      fieldComponent: value,
      editMode,
    })
  })
  return <div className="flex flex-col gap-y-6">{renderedComponents}</div>
}

export type DocumentDisplayOptionsFromArgs<
  ParamObsType extends ParamaterizedObservable<
    any,
    CollectionModels[keyof CollectionModels][],
    any
  >,
  CollectionName extends keyof CollectionModels,
  FieldsDisplaysType extends FieldDisplays<any>
> = DataViewOptions<
  CollectionName,
  ValueTypeFromArrayParamObs<ParamObsType>,
  Partial<
    ControlComponentsMapFromArgs<
      UnionToIntersection<ArgsTypeFromParamObs<ParamObsType>>
    >
  >,
  keyof FieldsDisplaysType
>

export type DocumentDisplayBuilder<
  OutputComponentPropsType extends Record<string, any>,
  BuilderType extends "multi" | "single" = "multi"
> = <
  CollectionName extends keyof CollectionModels,
  ParamObsType extends ParamaterizedObservable<
    any,
    CollectionModels[CollectionName][],
    any
  > = ParamaterizedObservable<any, CollectionModels[CollectionName][], any>
>(
  collectionNameForEdits: CollectionName,
  dataObsFn: (renderId: string) => ParamObsType
) => <FieldDisplaysType extends FieldDisplayFromRowsObservable<ParamObsType>>(
  adminDisplaySpecs: FieldDisplaysType,
  options?: BuilderType extends "multi"
    ? {} & DataViewOptions<
        CollectionName,
        ValueTypeFromArrayParamObs<ParamObsType>,
        Partial<
          ControlComponentsMapFromArgs<
            UnionToIntersection<ArgsTypeFromParamObs<ParamObsType>>
          >
        >,
        keyof FieldDisplaysType
      >
    : SingleDocumentDisplayOptions<
        CollectionName,
        ValueTypeFromArrayParamObs<ParamObsType>,
        keyof FieldDisplaysType
      >
) => React.ComponentType<OutputComponentPropsType>

export const buildDocumentDisplayFromFieldDisplays: DocumentDisplayBuilder<
  {
    doc: AnyGenericModel
  },
  "single"
> = (collectionName, dataObsFn) => (fieldDisplays, options) => {
  const {
    documentDisplay,
    columnActions = [],
    renderDocument = defaultRenderDocument,
  } = options || {}

  const { startEditing = false } = documentDisplay || {}

  objKeys(clone(fieldDisplays)).forEach((label) => {
    const fieldDisplay = fieldDisplays[label]
    if (isFieldDisplay(fieldDisplay)) {
      fieldDisplay.components.editable = getEditableComponentForFieldDisplay(
        fieldDisplay
      )
      fieldDisplay.components.display = getDisplayComponentForFieldDisplay(
        fieldDisplay
      )
    }
  })

  return component(
    (renderId) => {
      const writer = fbWriter(
        collectionName,
        prop(
          "doc",
          undefined as ValueTypeFromArrayParamObs<ReturnType<typeof dataObsFn>>
        ),
        {
          beforeWrite: ({ data, setError }) => {
            objKeys(fieldDisplays).forEach((fieldName) => {
              const display = fieldDisplays[fieldName]
              if (!isFieldDisplay(display)) return
              const value = display.components.getter(data as any)
              const validateFn = display.components.validate
                ? display.components.validate
                : () => null
              const error = validateFn(data as any, value, true)
              error &&
                setError(
                  fieldName as keyof CollectionModels[typeof collectionName],
                  error
                )
            })
            return data
          },
          afterWrite: (newData, oldData) => {
            if (options?.updateHydratedFields) {
              updateHydratedValues(
                options.updateHydratedFields,
                newData,
                oldData
              )
            }
          },
          editingStateOverride: settable(
            "editing",
            startEditing ? EditingState.Editing : EditingState.Cancelled
          ),
        }
      )

      return {
        ...writer,
      }
    },
    ({
      writeResults: { currentData, isEditing, errors },
      update,
      setEditing,
    }) => {
      if (!currentData) {
        return <div></div>
      }

      const columnNamesToComponents = {} as Record<
        keyof typeof fieldDisplays,
        React.ReactNode
      >

      objKeys(fieldDisplays).map((fieldName) => {
        const adminSpec = fieldDisplays[fieldName]
        if (!isFieldDisplay(adminSpec)) return
        const components = adminSpec.components

        let dataComponent = null

        if (
          adminSpec.editable &&
          components.setter &&
          isEditing &&
          !adminSpec?.hideComponent?.documentDisplay?.editable
        ) {
          const updateFn = (v) => {
            const newRow = components.setter(currentData, v)
            update(newRow)
          }

          const Component = components.editable
          dataComponent = (
            <Component
              update={updateFn}
              error={errors.byKey[fieldName as any]}
              row={currentData}
              value={components.getter(currentData)}
            ></Component>
          )
        } else if (!adminSpec?.hideComponent?.documentDisplay?.display) {
          const Component = components.display

          dataComponent = (
            <Component
              row={currentData}
              value={components.getter(currentData)}
            ></Component>
          )
        }

        if (dataComponent) {
          columnNamesToComponents[fieldName] = dataComponent
        }
      })

      const componentDisplay = renderDocument({
        components: columnNamesToComponents,
        editMode: isEditing,
      })

      const editingControls = isEditing ? (
        <div className="flex flex-grow justify-end space-x-3">
          <Button
            color="info"
            variant="contained"
            onClick={() => setEditing(EditingState.Cancelled)}
          >
            Cancel
          </Button>
          <Button
            disabled={errors.hasError}
            color="error"
            variant="contained"
            onClick={() => setEditing(EditingState.Saved)}
          >
            Save
          </Button>
        </div>
      ) : (
        <div>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setEditing(EditingState.Editing)
            }}
          >
            Edit
          </Button>
        </div>
      )

      const withoutViewEdit = columnActions.slice(1)
      const visibleActions = withoutViewEdit.filter((_) => {
        return _.isAvailable ? _.isAvailable(currentData) : true
      })

      const router = useRouter()
      const actionControls = (
        <div className="flex gap-5">
          {visibleActions.map((action) => {
            if (action.alwaysVisible && visibleActions.includes(action)) {
              return buildActionButtonFromSpec(
                collectionName,
                currentData,
                action,
                router
              )
            }
          })}
        </div>
      )

      const notAlwaysShownActions = visibleActions.filter(
        (_) => !_.alwaysVisible
      )

      const contextMenu = notAlwaysShownActions.length ? (
        <MultiColumnActionList
          actions={notAlwaysShownActions}
          collectionName={collectionName}
          getSelectedItems={() => [currentData]}
          selectionModel={[currentData.uid]}
          options={{
            icon: <MoreVertIcon></MoreVertIcon>,
          }}
        ></MultiColumnActionList>
      ) : (
        <div></div>
      )

      const controls = (
        <div className="flex w-full items-center justify-between">
          {!isEditing && actionControls}
          {editingControls}
        </div>
      )

      return (
        <div className="relative flex h-full flex-col px-4 pb-4">
          <div className="absolute right-0 top-1">{contextMenu}</div>
          <div className="overflow-auto">{componentDisplay}</div>
          <div className="mt-5 flex items-center justify-end">{controls}</div>
        </div>
      )
    }
  )
}
