import { EditableFieldProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { PhoneNumber } from "@/data/types/LocationEmployee"
import { buildPhoneNumberObject } from "@/helpers/buildPhoneNumberObject"
import { PhoneNumberInput } from "@/tailwind-components/application_ui/PhoneNumberInput"
import { TextFieldProps } from "@mui/material"
import { AsYouType } from "libphonenumber-js"

export const PhoneNumberEditor = ({
  update,
  value,
}: // otherProps
EditableFieldProps<any, string>) => {
  const valueOrEmptyString = value || ""
  const formattedPhoneNumber = new AsYouType("US").input(valueOrEmptyString)
  const lastCharIsParen =
    formattedPhoneNumber[formattedPhoneNumber.length - 1] == ")"
  const lastCharInValueIsNotParen =
    valueOrEmptyString[valueOrEmptyString.length - 1] != ")"

  const valueToShow =
    lastCharIsParen && lastCharInValueIsNotParen ? value : formattedPhoneNumber

  return (
    <div>
      <PhoneNumberInput
        onValueChange={(newNumber) => {
          update(newNumber)
        }}
        value={valueToShow}
      ></PhoneNumberInput>
    </div>
  )
}
