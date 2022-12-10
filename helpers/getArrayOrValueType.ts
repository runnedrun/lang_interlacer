export type GetArrayOrValueType<ValueType extends any> = ValueType extends any[]
  ? ValueType[any]
  : ValueType
