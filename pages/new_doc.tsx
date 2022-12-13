import { creators } from "@/data/fb"
import { CircularProgress } from "@mui/material"
import { useEffect } from "react"

const GenNewDocView = () => {
  useEffect(() => {
    creators.documentJob({}).then((ref) => {
      window.location.href = `/new_doc/${ref.id}`
    })
  }, [])

  return (
    <div className="w-full flex justify-center h-full items-center">
      <CircularProgress size="6rem" />
    </div>
  )
}

export default GenNewDocView
