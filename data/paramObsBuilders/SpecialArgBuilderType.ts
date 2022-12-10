import { ProcessorContext } from "@/views/view_builder/processSpecialArgs"

export type SpecialArgValueBuilder<ValueType> = (
  currentValue: ValueType,
  context: ProcessorContext
) => ValueType

export type SpecialArgBuilder<ValueType, SpecialArgType> = (
  defaultValue: ValueType,
  buildValue?: SpecialArgValueBuilder<ValueType>
) => SpecialArgType
