import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { Button } from "@mui/material"

export const CreateNewRowButton = <
  CollectionName extends keyof CollectionModels
>({
  newItemFn,
}: {
  newItemFn: () => Promise<any>
}) => {
  return (
    <Button className="p-3" variant="outlined" onClick={newItemFn}>
      New+
    </Button>
  )
}
