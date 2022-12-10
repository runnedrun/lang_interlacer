import { EditableComponent } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { Address } from "@/data/types/Store"
import { SingleEditableFieldComponent } from "@/page_helpers/admin/buildDataGridForFieldDisplays"
import { TextField } from "@mui/material"
import React from "react"

export const AddressEditor: SingleEditableFieldComponent<Address> = ({
  value,
  update,
}) => {
  const buildUpdater = (fieldName: keyof Address) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    update({ ...value, [fieldName]: e.target.value })
  }

  return (
    <div className="mb-2 px-2 flex flex-wrap gap-1">
      <TextField
        sx={{ mt: 2 }}
        onChange={buildUpdater("street")}
        label="Street"
        value={value?.street || ""}
      ></TextField>
      <TextField
        sx={{ mt: 2 }}
        onChange={buildUpdater("city")}
        label="City"
        value={value?.city || ""}
      ></TextField>
      <TextField
        sx={{ mt: 2 }}
        onChange={buildUpdater("state")}
        label="State"
        value={value?.state || ""}
      ></TextField>
      <TextField
        sx={{ mt: 2 }}
        onChange={buildUpdater("zip")}
        label="Zip"
        value={value?.zip || ""}
      ></TextField>
    </div>
  )
}
