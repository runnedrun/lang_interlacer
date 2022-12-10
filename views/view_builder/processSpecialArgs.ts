import { ArgsMap } from "@/data/builders/ArgsMap"
import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { isEqual, isUndefined } from "lodash"
import { buildValue } from "./specialArgProcessors/buildValue"

export type ProcessorContext = {
  props: Record<string, any>
}

export type ServersideProcessorContext = {
  query: Record<string, string | string[]>
}

export type ViewBuilderSpecialArg<ValueType extends any> = {
  _value: ValueType
  _readonly?: boolean
  _buildValue?: (currentValue: ValueType, args: ProcessorContext) => ValueType
  _buildServerSideValue?: (args: ServersideProcessorContext) => ValueType
  _isGenerated: boolean
  _skipArg?: boolean
}

export type ValueTypeFromSpecialArg<
  ArgType extends ViewBuilderSpecialArg<any>
> = ArgType extends ViewBuilderSpecialArg<infer ValueType> ? ValueType : never

export type ProcessorType<ValueType extends any> = (
  arg: ViewBuilderSpecialArg<ValueType>,
  context: ProcessorContext
) => ValueType

const processors: ProcessorType<any>[] = [buildValue]

function isClientSideSpecialArg(
  arg: ViewBuilderSpecialArg<any>
): arg is ViewBuilderSpecialArg<any> {
  return (
    !isUndefined((arg as ViewBuilderSpecialArg<any>)?._buildValue) ||
    !isUndefined((arg as ViewBuilderSpecialArg<any>)?._readonly)
  )
}

export const isSpecialArg = (arg: any): arg is ViewBuilderSpecialArg<any> => {
  return (
    isClientSideSpecialArg(arg) ||
    ((arg as ViewBuilderSpecialArg<any>)?._buildServerSideValue !== undefined ||
      (arg as ViewBuilderSpecialArg<any>)?._skipArg) !== undefined
  )
}

export const processServersideSpecialArgs = <
  ArgMapType extends Record<string, any>
>(
  argMap: ArgMapType,
  context: ServersideProcessorContext
): ArgMapType => {
  const processedArgs = {} as ArgMapType
  objKeys(argMap).forEach((key) => {
    const arg = argMap[key]
    const generatedArg = arg?._buildServerSideValue
      ? arg._buildServerSideValue(context)
      : arg

    processedArgs[key] = generatedArg
  })

  return processedArgs
}

export const processSpecialArgsAndExtractValues = <
  ArgMapType extends Record<string, any>
>(
  argMap: ArgMapType,
  context: ProcessorContext
): ArgMapType => {
  const processedArgs = {} as ArgMapType
  objKeys(argMap).forEach((key) => {
    const arg = argMap[key]
    const generatedArg = valueFromSpecialArg(arg, context)
    processedArgs[key] = generatedArg
  })

  return processedArgs
}

export const processSpecialArgs = <ArgMapType extends Record<string, any>>(
  argMap: ArgMapType,
  context: ProcessorContext
): ArgMapType => {
  const processedArgs = {} as ArgMapType
  objKeys(argMap).forEach((key) => {
    const arg = argMap[key]
    if (isClientSideSpecialArg(arg)) {
      const generatedArg = valueFromSpecialArg(arg, context)
      const isAnUpdate = !isEqual(generatedArg, arg._value)

      const update = {
        ...arg,
        _value: generatedArg,
        _skipArg: false,
      }

      if (isAnUpdate) {
        update._isGenerated = true
      }

      processedArgs[key] = update
    } else {
      processedArgs[key] = arg
    }
  })

  return processedArgs
}

export const valueFromSpecialArg = (arg: any, context: ProcessorContext) => {
  if (isClientSideSpecialArg(arg)) {
    const processedValue = processors.reduce((acc, processor) => {
      return { ...acc, _value: processor(arg, context) }
    }, arg)

    return processedValue._value
  } else {
    return arg
  }
}

export const updateArgMapWithSpecialProcessing = <
  ArgMapType extends Record<any, any>,
  KeyNameType extends keyof ArgMapType
>(
  argMap: ArgMapType,
  keyName: KeyNameType,
  newValue: ArgMapType[KeyNameType]
) => {
  const value = argMap[keyName]
  let valueToSet = newValue
  if (isClientSideSpecialArg(value)) {
    valueToSet = {
      ...value,
      _value: newValue,
      _isGenerated: false,
      _skipArg: false,
    }
  }
  return { ...argMap, [keyName]: valueToSet }
}
