import { batchSetters } from "@/data/fb"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { init } from "@/data/initFb"
import { writeBatch } from "@firebase/firestore"
import { GridSelectionModel } from "@mui/x-data-grid"
import React from "react"
import { Button, Menu, MenuItem } from "@mui/material"
import GradingIcon from "@mui/icons-material/Grading"
import { AnyGenericModel } from "@/data/baseTypes/Model"
import {
  AdminConfirmDialogue,
  AdminConfirmDialogueProps,
} from "./AdminConfirmDialogue"
import { toast } from "react-toastify"
import { NextRouter, useRouter } from "next/router"

export type ColumnActionSpec<
  CollectionNameForSet extends keyof CollectionModels,
  RowType extends AnyGenericModel
> = {
  action: (args: {
    updateRow: (
      newData: Partial<CollectionModels[CollectionNameForSet]>
    ) => void
    currentData: RowType
    router: NextRouter
  }) => void
  alwaysVisible?: boolean
  label: string
  icon?: React.ReactElement
  isAvailable?: (currentData: RowType) => boolean
  buttonColor?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "inherit"
    | undefined
}

type Options = {
  icon?: React.ReactElement
}

export const MultiColumnActionList = <
  CollectionName extends keyof CollectionModels,
  RowType extends AnyGenericModel
>({
  actions = [],
  getSelectedItems,
  collectionName,
  selectionModel,
  options = {},
}: {
  actions: ColumnActionSpec<CollectionName, RowType>[]
  collectionName: CollectionName
  getSelectedItems: () => RowType[]
  selectionModel: GridSelectionModel
  options?: Options
}) => {
  const router = useRouter()
  const [
    confirmDialogueProps,
    setConfirmDialogueProps,
  ] = React.useState<AdminConfirmDialogueProps>(null)

  const getSelecionApplicableToAction = (
    action: ColumnActionSpec<CollectionName, RowType>
  ) => {
    const actionIsAvailablefn = action.isAvailable || (() => true)
    return getSelectedItems().filter(actionIsAvailablefn)
  }

  const showConfirmDialogue = (
    action: ColumnActionSpec<CollectionName, RowType>
  ) => {
    setConfirmDialogueProps({
      handleConfirm: () => {
        takeActionOnAllSelectedItems(action)
        toast(
          `Performed "${action.label}" on ${
            getSelecionApplicableToAction(action).length
          } items.`
        )
        setConfirmDialogueProps(null)
      },
      handleCancel: () => setConfirmDialogueProps(null),
      message: `Are you want to perform action "${action.label}" for ${
        getSelecionApplicableToAction(action).length
      } items?`,
    })
  }

  const takeActionOnAllSelectedItems = async (
    action: ColumnActionSpec<CollectionName, RowType>
  ) => {
    const firestore = init()
    const newBatch = writeBatch(firestore)
    const itemsApplicableForThisAction = getSelecionApplicableToAction(action)
    const buildWrite = (id: string) => (
      data: CollectionModels[CollectionName]
    ) => batchSetters[collectionName](newBatch, id, data as any)
    if (itemsApplicableForThisAction.length > 400) {
      alert(
        "You can take this action on up to 400 items at a time. Please select fewer items."
      )
      return
    }
    await Promise.all(
      itemsApplicableForThisAction.map((item) => {
        return action.action({
          updateRow: buildWrite(item.uid),
          currentData: item,
          router,
        })
      })
    )
    newBatch.commit()
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const visibleActionsAndItemCount = actions
    .map((action) => {
      const isAvailableFn = action.isAvailable || (() => true)
      const selectedItems = getSelectedItems()
      const availableFor = selectedItems.filter((item) => isAvailableFn(item))
      return availableFor.length > 0
        ? { action: action, itemCount: availableFor.length }
        : null
    })
    .filter(Boolean)

  return selectionModel.length ? (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {options.icon || <GradingIcon></GradingIcon>}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {visibleActionsAndItemCount.map((actionAndItemCount) => {
          const action = actionAndItemCount.action
          const itemCount = actionAndItemCount.itemCount
          return (
            <MenuItem
              key={action.label}
              onClick={() => {
                showConfirmDialogue(action)
                handleClose()
              }}
            >
              {action.icon}
              {action.label} ({itemCount})
            </MenuItem>
          )
        })}
      </Menu>
      <AdminConfirmDialogue {...confirmDialogueProps}></AdminConfirmDialogue>
    </>
  ) : (
    <></>
  )
}
