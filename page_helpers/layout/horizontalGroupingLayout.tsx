import { flatten, omit } from "lodash"
import {
  defaultRenderFieldComponent,
  DocumentDisplayRenderFn,
} from "../admin/buildDocumentDisplayFromFieldDisplays"

export const horizontalGroupingLayout = <
  ColumnNames extends string | symbol | number
>(
  columnGrouping: ColumnNames[][]
): DocumentDisplayRenderFn<ColumnNames> => ({ components, editMode }) => {
  const groups = columnGrouping.map((columnNamesToGroup, i) => {
    return (
      <div key={i} className="flex flex-wrap items-center gap-3">
        {columnNamesToGroup.map((columnName) => {
          return defaultRenderFieldComponent({
            fieldComponent: components[columnName],
            editMode: editMode,
            fieldName: String(columnName),
          })
        })}
      </div>
    )
  })

  const ungroupedColumns = omit(components, flatten(columnGrouping))
  const rest = Object.entries(ungroupedColumns).map(([k, v]) =>
    defaultRenderFieldComponent({
      fieldName: String(k),
      fieldComponent: v,
      editMode,
    })
  )
  return (
    <div className="flex flex-col gap-y-2">
      {groups}
      {rest}
    </div>
  )
}
