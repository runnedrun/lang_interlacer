import { isForeignKeyField } from "./isForeignKeyField"

export const getPossibleHydratedValue = <RowType extends Record<string, any>>(
  row: any,
  fieldName: keyof RowType
) =>
  isForeignKeyField(row, fieldName) ? row.hydrated[fieldName] : row[fieldName]
