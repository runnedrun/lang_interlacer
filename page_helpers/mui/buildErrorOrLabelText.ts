import { KeyError } from "@/data/firebaseObsBuilders/fbWriter"
import { InputLabel } from "@mui/material"
import React from "react"

export const buildErrorOrLabelText = <
  ErrorsType extends Record<string, KeyError>
>(
  mainLabelText: string,
  errors: ErrorsType,
  thisKey: keyof ErrorsType
) => {
  return errors[thisKey] ? errors[thisKey].message : mainLabelText
}
