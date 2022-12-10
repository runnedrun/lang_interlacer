import {
  ProcessorContext,
  ViewBuilderSpecialArg,
} from "@/views/view_builder/processSpecialArgs"

export type PropArg<
  ValueType extends any,
  Optional extends Boolean = false
> = ViewBuilderSpecialArg<ValueType> & {
  _readonly: true
  _buildValue: (arg: ValueType, context: ProcessorContext) => ValueType
  _value: ValueType
  _readFromProp: true
  _optionalProp: Optional
}

export const propSpecialArg = <
  ValueType extends any,
  PropName extends string,
  Optional extends Boolean
>(
  propName: PropName,
  defaultValue: ValueType,
  optional: Optional
): PropArg<ValueType, Optional> => {
  const getProps = (lastValue: ValueType, context: ProcessorContext) => {
    const currentValue = context.props[propName] as ValueType
    return typeof currentValue === "undefined" ? defaultValue : currentValue
  }
  return {
    _readonly: true,
    _value: defaultValue,
    _buildValue: getProps,
    _readFromProp: true,
    _skipArg: true,
    _optionalProp: optional,
  } as PropArg<ValueType, Optional>
}
