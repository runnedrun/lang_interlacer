import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { TextField, TextFieldProps } from "@mui/material"
import React from "react"
import { useFieldDisplayAutofocus } from "../hoc/useFieldDisplayAutofocus"

export const EditableText = <
  Props extends SingleFieldEditableProps<string> & TextFieldProps
>({
  update,
  value,
  onEditingCancelled,
  onEditingComplete,
  ...textFieldPropsToPassThrough
}: Props & TextFieldProps) => {
  const ref = useFieldDisplayAutofocus()
  return (
    <TextField
      inputRef={ref}
      // sx={{
      //   "& .MuiInputBase-input": {
      //     // className: "py-4",
      //     padding: "16px",
      //   },
      // }}
      inputProps={{ className: "p-4" }}
      value={value || ""}
      onChange={(e) => {
        const value = e.target.value
        update(value)
      }}
      {...textFieldPropsToPassThrough}
    ></TextField>
  )
}
