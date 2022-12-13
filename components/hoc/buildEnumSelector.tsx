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

const getFromStringEnum = <T extends Record<string, string>>(
  enumObj: T,
  key: string
) => {
  const entry = Object.entries(enumObj).find(([k, v]) => v === key)
  return entry ? entry[0] : undefined
}

export const buildStringEnumSelector = <
  OptionsEnumType extends Record<number, string>
>(
  optionsEnum: OptionsEnumType,
  autocompleteOptions: AutocompleteOptions<string, false> = {
    renderLabel: (_) => _.toString(),
  }
) => (props: SingleFieldEditableProps<number> & { disabled?: boolean }) => {
  const options = objKeys(optionsEnum).map((_) => _.toString())

  return (
    <AdminComboxBox
      options={options}
      getIdFromValue={(_) => {
        const value = Language[_]

        return getFromStringEnum(Language, _ as any)
      }}
      getValueFromId={(_) => {
        return _ as any
      }}
      autocompleteOptions={autocompleteOptions as any}
      {...props}
    />
  )
}
