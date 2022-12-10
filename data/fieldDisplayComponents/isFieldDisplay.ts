import { FieldDisplay } from "@/page_helpers/admin/buildDataGridForFieldDisplays"

export const isFieldDisplay = (a: any): a is FieldDisplay => {
  return !!(a as FieldDisplay).components
}
