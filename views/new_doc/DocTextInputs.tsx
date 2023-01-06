import { ErrorType } from "@/data/firebaseObsBuilders/fbWriter"
import { DocumentJob, DocumentJobFile } from "@/data/types/DocumentJob"
import { buildErrorOrLabelText } from "@/page_helpers/mui/buildErrorOrLabelText"
import { FormControl, FormHelperText, Input, InputLabel } from "@mui/material"
import React from "react"
import { UploadFileComponent } from "./FileUploadComponent"

type DocTextInputsProps = {
  currentData: DocumentJob
  updateField: <KeyType extends keyof DocumentJob>(
    key: keyof DocumentJob,
    value: DocumentJob[KeyType]
  ) => void
  errors: ErrorType<DocumentJob>
  header: string
  langNumber: number
}

export const DocTextInputs = ({
  currentData,
  updateField,
  errors,
  header,
  langNumber,
}: DocTextInputsProps) => {
  const jobStarted = !!currentData.startJob

  const langFileKey = `lang${langNumber}File` as keyof DocumentJob
  const langTextKey = `lang${langNumber}Text` as keyof DocumentJob
  const currentFile = currentData[langFileKey] as DocumentJobFile

  return (
    <div className="w-full mb-10">
      <div className="flex items-center">
        <FormHelperText id={`lang${langNumber}-helper-text`} className="mb-2">
          {header}
        </FormHelperText>
        <div className="flex-grow text-center">OR</div>
        <div>
          <UploadFileComponent
            file={currentFile}
            docKey={currentData.uid}
            langId={langNumber.toString()}
            onFile={(file) => updateField(langFileKey, file)}
          ></UploadFileComponent>
        </div>
      </div>
      <FormControl
        className="w-full"
        disabled={jobStarted}
        error={!currentFile && !!errors.byKey.lang1Text}
      >
        <InputLabel htmlFor={`lang${langNumber}-input`}>
          {currentFile
            ? "Using file"
            : buildErrorOrLabelText(
                `Language ${langNumber}`,
                errors.byKey.lang1Text
              )}
        </InputLabel>
        {!currentFile && (
          <Input
            id={`lang${langNumber}-input`}
            aria-describedby={`lang${langNumber}-helper-text`}
            multiline
            className="w-full"
            value={currentData[langTextKey]}
            onChange={(e) => updateField(langTextKey, e.target.value)}
          />
        )}
      </FormControl>
    </div>
  )
}
