import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { prop } from "@/data/paramObsBuilders/prop"
import { component } from "@/views/view_builder/component"
import { isArray } from "lodash"
import { AdminComboxBox, AutocompleteOptions } from "./AdminComboBox"

export const buildForeignKeySelector = <
  ValuesType extends { uid: string },
  ArgsType extends Record<string, any>,
  IsMultiselect extends boolean
>(
  optionsObs: ParamaterizedObservable<ArgsType, ValuesType[], any>,
  autocompleteOptions: AutocompleteOptions<ValuesType, IsMultiselect>
) =>
  component(
    () => ({
      possibleValues: optionsObs,
      value: prop(
        "value",
        null as IsMultiselect extends true ? ValuesType[] : ValuesType,
        true
      ),
      update: prop(
        "update",
        null as (
          v: IsMultiselect extends true ? ValuesType[] : ValuesType
        ) => void
      ),
    }),
    ({ possibleValues, value, update }) => {
      const valuesArray = isArray(value) ? value : [value]
      const getValue = (id: string) => {
        const a = [...possibleValues, ...valuesArray].find(
          (_) => _.uid === id
        ) as any
        return a
      }
      const options = possibleValues
        .map((_) => _.uid)
        .sort((a, b) => {
          return autocompleteOptions
            .renderLabel(getValue(a))
            .localeCompare(autocompleteOptions.renderLabel(getValue(b)))
        })

      return (
        <AdminComboxBox
          options={options}
          getIdFromValue={(_) => _?.uid}
          getValueFromId={getValue}
          autocompleteOptions={autocompleteOptions as any}
          value={value}
          update={update}
        />
      )
    }
  )
