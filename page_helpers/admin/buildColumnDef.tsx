import { withErrorDisplay } from "@/components/hoc/withErrorDisplay"
import { withFieldDisplayOptions } from "@/components/hoc/withFieldDisplayOptions"
import {
  DisplayComponent,
  EditableComponent,
  FieldDisplayComponents,
  FieldTypeFromFieldDisplayComponents,
  ModelFromFieldDisplayComponents,
} from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { isUndefinedOrNull } from "@/helpers/isUndefinedOrNull"
import { Timestamp } from "@firebase/firestore"
import {
  GridColDef,
  GridComparatorFn,
  gridDateComparator,
  gridNumberComparator,
  gridStringOrNumberComparator,
  useGridApiContext,
} from "@mui/x-data-grid"
import { cloneDeep } from "lodash"
import { FieldDisplay } from "./buildDataGridForFieldDisplays"
import {
  columnTypeDisplayComponents,
  DefaultDisplayField,
} from "./columnTypeDisplayComponents"
import {
  columnTypeEditableComponents,
  DefaultEditableField,
} from "./columnTypeEditableComponents"
import { ColumnTypes, nativeColumnTypes } from "./columnTypes"

type ValueAndRow<RowType extends any, ValueType extends any> = {
  _row: RowType
  _value: ValueType
}

const fbTimestampComparator: GridComparatorFn<Timestamp> = (
  v1,
  v2,
  ...rest
) => {
  return gridDateComparator(v1.toDate(), v2.toDate(), ...rest)
}

export const comparatorsByType: Record<
  Exclude<ColumnTypes, "actions">,
  GridComparatorFn<any>
> = {
  string: gridStringOrNumberComparator,
  number: gridNumberComparator,
  date: gridDateComparator,
  boolean: gridNumberComparator,
  dateTime: gridDateComparator,
  text: gridStringOrNumberComparator,
  fbTimestamp: fbTimestampComparator,
}

export const getDisplayComponentForFieldDisplay = (
  fieldDisplay: FieldDisplay<any>
): DisplayComponent<any, any> => {
  return (
    fieldDisplay.components.display ||
    (fieldDisplay.type && columnTypeDisplayComponents[fieldDisplay.type]) ||
    DefaultDisplayField
  )
}

export const getEditableComponentForFieldDisplay = (
  fieldDisplay: FieldDisplay<any>
): EditableComponent<any, any> => {
  return withErrorDisplay(
    fieldDisplay.components.editable ||
      (fieldDisplay.type && columnTypeEditableComponents[fieldDisplay.type]) ||
      DefaultEditableField
  )
}

export const DEFAULT_CELL_WIDTH = 150

export const buildColumnDef = <
  FieldDisplayComponentsType extends FieldDisplayComponents<any, any>
>(
  fieldName: string,
  fieldDisplay: FieldDisplay<FieldDisplayComponentsType>
) => {
  const type = fieldDisplay.type || "string"

  const DisplayComponent = getDisplayComponentForFieldDisplay(fieldDisplay)

  const renderCellObj = {
    renderCell: (data) => {
      return (
        <DisplayComponent
          value={data.value?._value}
          row={data.row}
        ></DisplayComponent>
      )
    },
  }

  const EditableComponent = withFieldDisplayOptions(
    getEditableComponentForFieldDisplay(fieldDisplay),
    { autoFocus: true, popover: true }
  )

  const renderEditCellObj = {
    renderEditCell: (data) => {
      const apiRef = useGridApiContext()
      return (
        <EditableComponent
          error={data.error}
          row={data.row}
          value={data.value?._value}
          onEditingComplete={() => {
            apiRef.current.stopCellEditMode({ id: data.id, field: fieldName })
          }}
          onEditingCancelled={() => {
            apiRef.current.stopCellEditMode({
              id: data.id,
              field: fieldName,
              ignoreModifications: true,
            })
          }}
          update={(newValue) => {
            apiRef.current.setEditCellValue({
              id: data.id,
              field: data.field,
              value: isUndefinedOrNull(newValue)
                ? null
                : { _value: newValue, _row: data.row },
            })
          }}
        ></EditableComponent>
      )
    },
  }

  const comparator: GridComparatorFn<
    ValueAndRow<
      ModelFromFieldDisplayComponents<FieldDisplayComponentsType>,
      FieldTypeFromFieldDisplayComponents<FieldDisplayComponentsType>
    >
  > = (data1, data2) => {
    const getValueForSort = fieldDisplay.valueForSort
      ? fieldDisplay.valueForSort
      : ({ value }) => value

    const vs1 = getValueForSort({
      row: data1?._row,
      value: data1?._value,
    })

    const vs2 = getValueForSort({
      row: data2?._row,
      value: data2?._value,
    })

    return comparatorsByType[type](vs1, vs2)
  }

  const gridColDef: GridColDef<
    ModelFromFieldDisplayComponents<FieldDisplayComponentsType>,
    ValueAndRow<
      ModelFromFieldDisplayComponents<FieldDisplayComponentsType>,
      any
    >
  > = {
    editable:
      !!fieldDisplay.editable &&
      !fieldDisplay.hideComponent?.tableDisplay?.editable,
    field: String(fieldName),
    width: fieldDisplay.width || DEFAULT_CELL_WIDTH,
    type: nativeColumnTypes.includes(type) ? type : "string",
    preProcessEditCellProps: (params) => {
      return {
        ...params.props,
        error:
          fieldDisplay.components.validate &&
          fieldDisplay.components.validate(
            params.row,
            params.props.value?._value,
            params.hasChanged
          ),
      }
    },
    valueSetter: ({ row, value }) => {
      const valueFromValue = value?._value
      if (!fieldDisplay.components.setter) {
        console.warn(
          `No field name in the field components object for ${fieldName}. Cannot edit this field`
        )
        return row
      }

      return fieldDisplay.components.setter(cloneDeep(row), valueFromValue)
    },
    valueGetter: ({ row }) => {
      return {
        _value: fieldDisplay.components.getter(row),
        _row: row,
      }
    },
    valueFormatter: ({ value }) => {
      return value?._value
    },
    sortComparator: comparator,
    ...renderCellObj,
    ...renderEditCellObj,
  }
  return gridColDef
}
