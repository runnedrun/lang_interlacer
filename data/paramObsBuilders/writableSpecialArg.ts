import {
  ProcessorContext,
  ViewBuilderSpecialArg,
} from "@/views/view_builder/processSpecialArgs"
import { SpecialArgValueBuilder } from "./SpecialArgBuilderType"

export type WritableArg<ValueType> = Omit<
  ViewBuilderSpecialArg<ValueType>,
  "_readonly"
>

export const writableSpecialArg = <ValueType extends any>(
  value: ValueType,
  buildValue?: SpecialArgValueBuilder<ValueType>
): WritableArg<ValueType> => ({
  _value: value,
  _buildValue: buildValue,
  _isGenerated: true,
  _skipArg: true,
})
