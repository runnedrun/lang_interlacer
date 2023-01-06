import { creators } from "@/data/fb"
import { CircularProgress } from "@mui/material"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

const GenNewDocView = () => {
  useEffect(() => {
    const uuid = uuidv4()
    window.location.href = `/new_doc/${uuid}`
  }, [])

  return (
    <div className="w-full flex justify-center h-full items-center">
      <CircularProgress size="6rem" />
    </div>
  )
}

export default GenNewDocView
