import { isServerside } from "@/helpers/isServerside"
import {
  ProcessorContext,
  ViewBuilderSpecialArg,
} from "@/views/view_builder/processSpecialArgs"
import {
  SpecialArgBuilder,
  SpecialArgValueBuilder,
} from "./SpecialArgBuilderType"

export type ReadOnlyArg<ValueType> = ViewBuilderSpecialArg<ValueType> & {
  _readonly: true
}

export const readonlySpecialArg = <ValueType>(
  value: ValueType,
  buildValue: SpecialArgValueBuilder<ValueType>
): ReadOnlyArg<ValueType> => ({
  _readonly: true,
  _value: value,
  _buildValue: buildValue,
  _isGenerated: true,
  _skipArg: true,
})
