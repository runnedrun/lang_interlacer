import { DocumentJobFile } from "@/data/types/DocumentJob"
import { getStorage, uploadBytes } from "@firebase/storage"
import { Button, CircularProgress, Tooltip } from "@mui/material"
import { getDownloadURL, ref } from "firebase/storage"
import React, { useState } from "react"

const storage = getStorage()

export const UploadFileComponent = ({
  file,
  onFile,
  langId,
  docKey,
  userId,
}: {
  file: DocumentJobFile
  onFile: (url: DocumentJobFile) => void
  docKey: string
  langId: string
  userId: string
}) => {
  const [uploading, setUploading] = useState(false)

  const uploadTextFile = (e) => {
    const files = e.target.files || []
    if (!files.length) return
    setUploading(true)
    const fileToUpload = files[0]
    const fileRef = ref(storage, `doc-job-files/${docKey}-${langId}}.txt`)
    const upload = uploadBytes(fileRef, fileToUpload)
    upload.then(() => {
      setUploading(false)
      getDownloadURL(fileRef).then((url) => {
        onFile({ url, name: fileToUpload.name })
      })
    })
  }

  return (
    <div className="flex items-center">
      <div>
        {uploading ? <CircularProgress size=".5rem"></CircularProgress> : null}
      </div>
      <label htmlFor={`upload-file-${langId}`}>
        {userId ? (
          <Tooltip title="File format: .txt">
            <Button variant="contained" color="info" component="span">
              {file ? file.name : "Upload file"}
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="File upload only available to logged in users. Sign in or create an account.">
            <span>
              <Button
                variant="contained"
                color="info"
                component="span"
                disabled
              >
                Upload file
              </Button>
            </span>
          </Tooltip>
        )}
        <input
          accept=".txt"
          id={`upload-file-${langId}`}
          type="file"
          className="sr-only"
          onChange={uploadTextFile}
        />
      </label>
    </div>
  )
}
