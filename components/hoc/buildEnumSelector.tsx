import { isNaN } from "lodash"

import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { objKeys } from "@/helpers/objKeys"
import { AdminComboxBox, AutocompleteOptions } from "./AdminComboBox"

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
