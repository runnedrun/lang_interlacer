import { EditableFieldProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { objKeys } from "@/helpers/objKeys"
import { FormControlLabel, FormGroup, Switch } from "@mui/material"
import React from "react"

export const buildEditableTogglesList = <ToggleNames extends string>(
  toggles: Record<string, ToggleNames>
) => ({
  value,
  update,
}: EditableFieldProps<any, { [key in ToggleNames]: any }>) => {
  return (
    <div>
      {objKeys(toggles).map((toggleLabel) => {
        const toggleFieldName = toggles[toggleLabel]
        return (
          <FormGroup key={toggleLabel}>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked={value[toggleFieldName]}
                  onChange={(e) => {
                    update({
                      ...value,
                      [toggleFieldName]: e.target.checked,
                    })
                  }}
                />
              }
              label={toggleLabel}
            />
          </FormGroup>
        )
      })}
    </div>
  )
}
