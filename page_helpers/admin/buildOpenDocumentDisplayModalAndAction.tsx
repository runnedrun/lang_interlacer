import { FieldDisplayComponents } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { CollectionModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { ValueTypeFromArrayParamObs } from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { settable } from "@/data/paramObsBuilders/settable"
import { component } from "@/views/view_builder/component"
import Modal from "@mui/material/Modal"
import { Box } from "@mui/system"
import React from "react"
import { FieldDisplays } from "./buildDataGridForFieldDisplays"
import { DocumentDisplayOptionsFromArgs } from "./buildDocumentDisplayFromFieldDisplays"
import { buildSingleDocumentDisplay } from "./buildSingleDocumentDisplay"
import { ColumnActionSpec } from "./MultiColumnActionList"

const modalChildContainerStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
}

export const buildOpenDocumentDisplayModalAndAction = <
  CollectionName extends keyof CollectionModels,
  ParamObsType extends ParamaterizedObservable<
    any,
    CollectionModels[CollectionName][],
    any
  >
>(
  collectionName: CollectionName,
  dataObsFn: (renderId: string) => ParamObsType
) => <
  FieldDisplaySpecType extends FieldDisplayComponents<any, any>,
  FieldDisplaysType extends FieldDisplays<FieldDisplaySpecType>
>(
  adminSpecs: FieldDisplaysType,
  options?: DocumentDisplayOptionsFromArgs<
    ParamObsType,
    CollectionName,
    FieldDisplaysType
  >
): {
  actionSpec: ColumnActionSpec<
    CollectionName,
    ValueTypeFromArrayParamObs<ParamObsType>
  >
  ModalComponent: React.ComponentType
} => {
  const DocumentDisplay = buildSingleDocumentDisplay(collectionName, dataObsFn)(
    adminSpecs,
    {
      ...options,
      documentDisplay: { ...options.documentDisplay, startEditing: true },
    }
  )

  const openAndDocKey = settable("isOpenAndDocKey", {
    isOpen: false,
    docKey: null as string,
  })

  const ModalComponent = component(
    () => ({ openAndDocKey }),
    ({ isOpenAndDocKey, setIsOpenAndDocKey }) => {
      return (
        <Modal
          disableScrollLock
          open={isOpenAndDocKey?.isOpen || false}
          onClose={() => setIsOpenAndDocKey(null)}
          // open={true}
          // onClose={() => setIsOpenAndDocKey(null)}
        >
          <Box sx={modalChildContainerStyle} className={"h-2/3 p-2"}>
            <DocumentDisplay
              // docKey={"0luSQ7e3n8WhBcC5f1jh"}
              // docKey={"test-1"}
              docKey={isOpenAndDocKey?.docKey}
            />
          </Box>
        </Modal>
      )
    }
  )

  return {
    actionSpec: {
      action: ({ currentData }) => {
        openAndDocKey.attach({
          isOpenAndDocKey: { isOpen: true, docKey: currentData.uid },
        })
      },
      label: "View/Edit",
    },
    ModalComponent,
  }
}
