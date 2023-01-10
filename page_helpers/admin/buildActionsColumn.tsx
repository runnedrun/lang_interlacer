import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import {
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridColDef,
  GridRowParams,
} from "@mui/x-data-grid"
import { Delete } from "@mui/icons-material"
import { archiveDoc } from "@/data/fb"

export const buildActionsColumn = <
  CollectionName extends keyof CollectionModels
>(
  collectionName: CollectionName,
  getOtherActions: (
    params: GridRowParams<CollectionModels[CollectionName]>
  ) => React.ReactElement<GridActionsCellItemProps>[] = () => []
) => {
  return {
    field: "actions",
    type: "actions",
    getActions: (params: GridRowParams<CollectionModels[CollectionName]>) => [
      <GridActionsCellItem
        key="delete"
        icon={<Delete />}
        label="Delete"
        onClick={() => {
          archiveDoc[collectionName](String(params.id))
        }}
        onResize={() => {}}
        onResizeCapture={() => {}}
        nonce=""
      />,
      ...getOtherActions(params),
    ],
  } as GridColDef
}
