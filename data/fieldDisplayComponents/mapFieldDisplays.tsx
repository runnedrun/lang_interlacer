import { objKeys } from "@/helpers/objKeys"
import {
  FieldDisplay,
  FieldDisplays,
} from "@/page_helpers/admin/buildDataGridForFieldDisplays"
import { GridColDef } from "@mui/x-data-grid"
import { cloneDeep } from "lodash"

import React from "react"
import { AnyGenericModel } from "../baseTypes/Model"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import {
  FieldDisplayComponents,
  ModelFromFieldDisplayComponents,
} from "./fieldDisplayComponentsBuilders"
import { isFieldDisplay } from "./isFieldDisplay"

export const mapComponents = <
  InputRowType extends AnyGenericModel,
  InputFieldType extends any,
  OutputRowType extends AnyGenericModel
>(
  UnderlyingSpec: FieldDisplayComponents<InputRowType, InputFieldType>,
  mapRowToUnderlying: (row: OutputRowType) => InputRowType,
  updateRowFromUnderlying?: (
    row: OutputRowType,
    underlying: InputRowType
  ) => OutputRowType
): FieldDisplayComponents<OutputRowType, InputFieldType> => {
  const editable: Partial<
    FieldDisplayComponents<OutputRowType, InputFieldType>
  > = UnderlyingSpec.editable
    ? {
        editable({ row, value, ...rest }) {
          return (
            <UnderlyingSpec.editable
              row={mapRowToUnderlying(row)}
              value={value}
              {...rest}
            />
          )
        },
      }
    : {}

  const setter: Partial<FieldDisplayComponents<OutputRowType, InputFieldType>> =
    UnderlyingSpec.setter && updateRowFromUnderlying
      ? {
          setter(row, value) {
            const updatedUnderlying = UnderlyingSpec.setter(
              mapRowToUnderlying(row),
              value
            )
            const updatedRow = updateRowFromUnderlying(
              cloneDeep(row),
              updatedUnderlying
            )
            return updatedRow
          },
        }
      : {}

  const display: Partial<
    FieldDisplayComponents<OutputRowType, InputFieldType>
  > = UnderlyingSpec.display
    ? {
        display({ row, value }) {
          return (
            <UnderlyingSpec.display
              row={mapRowToUnderlying(row)}
              value={value}
            ></UnderlyingSpec.display>
          )
        },
      }
    : {}

  const validate: Partial<
    FieldDisplayComponents<OutputRowType, InputFieldType>
  > = UnderlyingSpec.validate
    ? {
        validate(row, value, hasChanged) {
          return UnderlyingSpec?.validate(
            mapRowToUnderlying(row),
            value,
            hasChanged
          )
        },
      }
    : {}

  return {
    getter(row) {
      return UnderlyingSpec.getter(mapRowToUnderlying(row))
    },
    ...display,
    ...editable,
    ...setter,
    ...validate,
  }
}

type FieldDisplaySpecTypeFromColumnDef<
  RowType extends AnyGenericModel,
  ColumnDefType extends GridColDef<RowType, any, any>
> = FieldDisplayComponents<RowType, ReturnType<ColumnDefType["valueGetter"]>>

type MappedFieldDisplays<
  UnderlyingSpecsType extends FieldDisplays<FieldDisplayComponents<any, any>>,
  OutputType extends AnyGenericModel
> = {
  [key in keyof UnderlyingSpecsType]: UnderlyingSpecsType[key] extends FieldDisplay<
    FieldDisplayComponents<any, infer FieldType>
  >
    ? FieldDisplay<FieldDisplayComponents<OutputType, FieldType>>
    : UnderlyingSpecsType[key] extends GridColDef<
        infer RowType,
        infer ValueType
      >
    ? RowType extends AnyGenericModel
      ? FieldDisplaySpecTypeFromColumnDef<
          RowType,
          GridColDef<RowType, ValueType>
        >
      : never
    : never
}

export const mapFieldDisplaysForDataObs = <
  OutputType extends AnyGenericModel,
  FieldDisplaySpecType extends FieldDisplayComponents<any, any>,
  UnderlyingSpecsType extends FieldDisplays<FieldDisplaySpecType>
>(
  dataObs: ParamaterizedObservable<any, OutputType[], any>,
  underlyingSpecs: UnderlyingSpecsType,
  mapRowToUnderlying: (
    row: OutputType
  ) => ModelFromFieldDisplayComponents<FieldDisplaySpecType>,
  updateRowFromUnderlying?: (
    row: OutputType,
    underlying: ModelFromFieldDisplayComponents<FieldDisplaySpecType>
  ) => OutputType
) => {
  const returnObj = {} as MappedFieldDisplays<UnderlyingSpecsType, OutputType>
  objKeys(underlyingSpecs).forEach((fieldName) => {
    const spec = underlyingSpecs[fieldName]
    if (isFieldDisplay(spec)) {
      const newFieldDisplaySpec = mapComponents(
        spec.components,
        mapRowToUnderlying,
        updateRowFromUnderlying
      )
      returnObj[fieldName] = {
        ...spec,
        components: newFieldDisplaySpec,
      } as any
    } else {
      // todo implement the grid col def conversion, when I want it
      console.warn(
        "you are trying to map a GridColDef, but this hasn't been implemented yet"
      )
      returnObj[fieldName] = spec as any
    }
  })

  return returnObj
}
