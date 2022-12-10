import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { ClickablePillDisplay } from "@/tailwind-components/application_ui/input_groups/ClickablePillDisplay"
import { Item } from "@/tailwind-components/application_ui/TypeaheadDropdown"
import { Box } from "@mui/material"
import React from "react"

export const EditableListDisplay = <
  ValueType extends string[],
  Args extends SingleFieldEditableProps<ValueType>
>({
  value,
  update,
}: Args) => {
  const valueOrEmpty = value || []
  const items: Item[] = valueOrEmpty.map((_, i) => {
    return {
      text: _,
      id: _,
    }
  })
  return (
    <Box className="p-2">
      <ClickablePillDisplay
        items={items}
        onChange={(newItems) => {
          update(Object.values(newItems).map((_) => _.text) as ValueType)
        }}
      ></ClickablePillDisplay>
    </Box>
  )
}
