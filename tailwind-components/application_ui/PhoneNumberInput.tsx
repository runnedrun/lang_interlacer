import { TextField, TextFieldProps } from "@mui/material"

export const PhoneNumberInput = ({
  value,
  onValueChange,
  ...otherProps
}: {
  value: string
  onValueChange: (value: string) => void
} & TextFieldProps) => {
  return (
    <TextField
      value={value}
      className="col-span-4"
      type={"tel"}
      autoComplete="tel"
      onChange={(e) => {
        onValueChange(e.target.value || "")
      }}
      {...otherProps}
    />
  )
}
