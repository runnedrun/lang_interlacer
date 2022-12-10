import { PhoneNumber } from "@/data/types/LocationEmployee"
import parsePhoneNumber from "libphonenumber-js"

export const buildPhoneNumberString = (phoneNumber: PhoneNumber) => {
  return `+${phoneNumber.countryCode}${phoneNumber.number}`
}

export const buildPrettyPhoneNumber = (phoneNumber: PhoneNumber) => {
  return parsePhoneNumber(
    `+${phoneNumber.countryCode}${phoneNumber.number}`
  )?.formatNational()
}
