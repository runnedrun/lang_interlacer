import {
  InputBase,
  InputBaseProps,
  Paper,
  Popper,
  TextField,
} from "@mui/material"
import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { useFieldDisplayAutofocus } from "@/components/hoc/useFieldDisplayAutofocus"
import React, { useContext } from "react"
import { FieldDisplayOptionsContext } from "@/components/FieldDisplayOptionsContext"
import { component } from "@/views/view_builder/component"

export const EditableTextField = <
  Props extends SingleFieldEditableProps<string>
>({
  value,
  update,
  onEditingComplete = () => {},
  onEditingCancelled = () => {},
}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>()
  const ref = useFieldDisplayAutofocus()
  const options = useContext(FieldDisplayOptionsContext)

  const handleRef = React.useCallback((el: HTMLElement | null) => {
    setAnchorEl(el)
  }, [])

  const handleChange = React.useCallback<
    NonNullable<InputBaseProps["onChange"]>
  >(
    (event) => {
      const newValue = event.target.value
      update(newValue)
    },
    [update]
  )

  const handleKeyDown = React.useCallback<
    NonNullable<InputBaseProps["onKeyDown"]>
  >(
    (event) => {
      if (event.key === "Escape") {
        onEditingCancelled()
        return false
      }

      if (event.key === "Enter" && !event.shiftKey) {
        onEditingComplete()
        return false
      }
    },
    [update]
  )

  const input = (
    <InputBase
      inputRef={ref}
      multiline
      rows={4}
      value={value}
      sx={{ textarea: { resize: "both" }, width: "100%" }}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )

  // to fix typing
  const args = {} as any

  const component = options.popover ? (
    <div style={{ alignSelf: "flex-start" }}>
      <div
        ref={handleRef}
        style={{
          height: 1,
          width: "100%",
          display: "block",
          position: "absolute",
          top: 0,
        }}
      />
      {anchorEl && (
        <Popper
          open
          anchorEl={anchorEl}
          placement="bottom-start"
          components={{}}
          componentsProps={{}}
          {...args}
        >
          <Paper elevation={1} sx={{ p: 1, minWidth: "100%" }}>
            {input}
          </Paper>
        </Popper>
      )}
    </div>
  ) : (
    <div>{input}</div>
  )

  return component
}
