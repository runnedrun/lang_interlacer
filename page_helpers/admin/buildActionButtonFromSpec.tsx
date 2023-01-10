import { AnyGenericModel } from "@/data/baseTypes/Model"
import { setters } from "@/data/fb"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { Button, IconButton, Typography } from "@mui/material"
import { GridActionsCellItem } from "@mui/x-data-grid"
import { NextRouter } from "next/router"
import React from "react"
import { toast } from "react-toastify"
import { ColumnActionSpec } from "./MultiColumnActionList"

export const buildActionButtonFromSpec = <
  CollectionName extends keyof CollectionModels,
  RowType extends AnyGenericModel
>(
  collectionName: CollectionName,
  currentRow: RowType,
  action: ColumnActionSpec<CollectionName, RowType>,
  router: NextRouter
) => {
  const runAction = () => {
    const updateRow = (newData) =>
      setters[collectionName](String(currentRow.uid), newData)
    action.action({ updateRow, currentData: currentRow, router })
    toast(`Performed "${action.label}".`)
  }

  let actionCellComponent = (
    <GridActionsCellItem
      key={action.label}
      label={action.label}
      onClick={runAction}
      showInMenu={true}
      icon={action.icon as any}
      onResize={() => {}}
      onResizeCapture={() => {}}
      nonce=""
    />
  )

  const colorObj = action.buttonColor ? { color: action.buttonColor } : {}

  if (action.alwaysVisible) {
    actionCellComponent = action.icon ? (
      <IconButton key={action.label} {...colorObj} onClick={runAction}>
        {action.icon}
      </IconButton>
    ) : (
      <Button key={action.label} {...colorObj} onClick={runAction}>
        {action.label}
      </Button>
    )
  }
  return actionCellComponent
}
