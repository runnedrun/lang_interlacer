import { createContext } from "react"

export type FieldDisplayOptions = { autoFocus?: boolean; popover?: boolean }
export const fieldDisplayContextDefaultValues: FieldDisplayOptions = {
  autoFocus: false,
  popover: false,
}
export const FieldDisplayOptionsContext = createContext(
  fieldDisplayContextDefaultValues
)
