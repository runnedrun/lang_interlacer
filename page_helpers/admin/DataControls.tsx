import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter"
import { objKeys } from "@/helpers/objKeys"
import { SingleEditableFieldComponent } from "./buildDataGridForFieldDisplays"

export const DataControls = ({
  dataControlMap = {},
  controlsValuesAndSetters,
}: {
  dataControlMap: Record<string, SingleEditableFieldComponent<any>>
  controlsValuesAndSetters: Record<string, any>
}) => {
  const controls = objKeys(dataControlMap).map((fieldName) => {
    const value = controlsValuesAndSetters[fieldName]
    const setter =
      controlsValuesAndSetters[`set${capitalizeFirstLetter(fieldName)}`]

    const Component = dataControlMap[fieldName]
    return (
      <Component
        key={fieldName}
        error={null}
        value={value}
        update={setter}
        label={fieldName}
      ></Component>
    )
  })

  return <>{controls}</>
}
