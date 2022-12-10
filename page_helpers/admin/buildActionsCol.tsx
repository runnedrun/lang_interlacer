import { GridRowParams, GridActionsCellItem } from "@mui/x-data-grid"
import { setters } from "@/data/fb"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { ColumnActionSpec } from "./MultiColumnActionList"
import { toast } from "react-toastify"
import { AnyGenericModel } from "@/data/baseTypes/Model"
import { NextRouter } from "next/router"
import React from "react"
import { Button, IconButton } from "@mui/material"
import { buildActionButtonFromSpec } from "./buildActionButtonFromSpec"

export const buildActionsCol = <
  CollectionName extends keyof CollectionModels,
  RowType extends AnyGenericModel
>(
  collectionName: CollectionName,
  colActions: ColumnActionSpec<CollectionName, RowType>[],
  router: NextRouter
) => {
  return {
    field: "actions",
    type: "actions",
    flex: 1,
    getActions: (params: GridRowParams<RowType>) => {
      return colActions
        .filter((_) => (_.isAvailable ? _.isAvailable(params.row) : true))
        .map((action) =>
          buildActionButtonFromSpec(collectionName, params.row, action, router)
        )
    },
  }
}
