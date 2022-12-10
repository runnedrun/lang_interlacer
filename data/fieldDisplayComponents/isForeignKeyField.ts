import { isArray } from "lodash"

export const isForeignKeyOrKeysField = <RowType extends Record<string, any>>(
  row: any,
  fieldName: keyof RowType
) => isForeignKeyField(row, fieldName) || isForeignKeysField(row, fieldName)

export const isForeignKeyField = <RowType extends Record<string, any>>(
  row: any,
  fieldName: keyof RowType
) => {
  const hydratedData = row.hydrated && row.hydrated[fieldName]
  return hydratedData
}

export const isForeignKeysField = <RowType extends Record<string, any>>(
  row: any,
  fieldName: keyof RowType
) => {
  const hydratedData = row.hydrated && row.hydrated[fieldName]
  return hydratedData && isArray(hydratedData)
}
