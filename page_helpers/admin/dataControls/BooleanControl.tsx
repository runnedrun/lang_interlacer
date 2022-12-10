import { SingleEditableFieldComponent } from "../buildDataGridForFieldDisplays"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"

export const BooleanControl: SingleEditableFieldComponent<boolean> = ({
  update,
  value,
  label,
}) => {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value}
          onChange={(e) => {
            update(e.target.checked)
          }}
        />
      }
      label={label}
    />
  )
}
