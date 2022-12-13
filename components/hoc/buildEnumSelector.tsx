import { isNaN } from "lodash"

import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { objKeys } from "@/helpers/objKeys"
import { AdminComboxBox, AutocompleteOptions } from "./AdminComboBox"
import { Language } from "@/data/types/RawParagraph"

export const buildEnumSelector = <
  OptionsEnumType extends Record<number, string>
>(
  optionsEnum: OptionsEnumType,
  autocompleteOptions: AutocompleteOptions<number, false> = {
    renderLabel: (_) => _.toString(),
  }
) => (props: SingleFieldEditableProps<number>) => {
  const optionNumbers = objKeys(optionsEnum)
    .filter((key) => !isNaN(Number(key)))
    .map((_) => Number(_))

  return (
    <AdminComboxBox
      options={optionNumbers}
      getIdFromValue={(_) => _}
      getValueFromId={(_) => _}
      autocompleteOptions={autocompleteOptions}
      {...props}
    />
  )
}

export const getFromStringEnum = <T extends Record<string, string>>(
  enumObj: T,
  key: string | number | symbol
) => {
  const entry = Object.entries(enumObj).find(([k, v]) => v === key)
  return entry ? entry[0] : undefined
}

export const buildStringEnumSelector = <
  OptionsEnumType extends Record<number, string>
>(
  optionsEnum: OptionsEnumType,
  autocompleteOptions: AutocompleteOptions<string, false> = {
    renderLabel: (_) => _,
  }
) => (props: SingleFieldEditableProps<string> & { disabled?: boolean }) => {
  const options = objKeys(optionsEnum).map((_) => String(_))

  if (!autocompleteOptions.renderLabel) {
    autocompleteOptions.renderLabel = (_) => _
  }

  return (
    <AdminComboxBox
      options={options}
      getIdFromValue={(_) => {
        return optionsEnum[_]
      }}
      getValueFromId={(_) => {
        const value = getFromStringEnum(optionsEnum, _)
        return value as any
      }}
      autocompleteOptions={autocompleteOptions as any}
      {...props}
    />
  )
}
