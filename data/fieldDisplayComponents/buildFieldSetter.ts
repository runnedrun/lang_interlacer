import { cloneDeep, isArray, isUndefined, set } from "lodash"
import { isForeignKeyField } from "./isForeignKeyField"

export const buildFieldSetter = <
  RowType extends Record<string, any>,
  FieldType extends any
>(
  fieldName: keyof RowType
) => (row: RowType, newValue: FieldType) => {
  const anyNewValue = newValue as any
  const copy = cloneDeep(row)
  let valueToSet = anyNewValue

  if (isForeignKeyField(row, fieldName)) {
    if (isArray(valueToSet)) {
      valueToSet = isUndefined(anyNewValue)
        ? null
        : anyNewValue.map((_) => _.uid)
    } else {
      valueToSet = isUndefined(anyNewValue?.uid) ? null : anyNewValue.uid
    }

    set(copy, `hydrated.${fieldName}`, anyNewValue)
  }

  set(copy, fieldName, valueToSet)

  return copy
}
