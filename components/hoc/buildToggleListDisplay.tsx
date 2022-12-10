import { AnyGenericModel } from "@/data/baseTypes/Model"
import { DisplayComponent } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"

export const buildToggleListDisplay = <RowType extends AnyGenericModel>(
  togglesGetter: (row: RowType) => Record<string, boolean>
): DisplayComponent<RowType, any> => ({ row }) => {
  const toggledObj = togglesGetter(row)
  const displays = Object.entries(toggledObj)
    .filter(([k, v]) => Boolean(v))
    .map(([k, v]) => k)
    .join(", ")
  return <div className="flex">{displays.length ? displays : "None"}</div>
}
