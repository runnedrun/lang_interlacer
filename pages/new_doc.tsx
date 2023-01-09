import { CircularProgress } from "@mui/material"
import Router from "next/router"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

const GenNewDocView = () => {
  useEffect(() => {
    const uuid = uuidv4()
    Router.push({ pathname: `/new_doc/${uuid}`, query: { docJobKey: uuid } })
    // window.location.href = `/new_doc/${uuid}`
  }, [])

  return (
    <div className="w-full flex justify-center h-full items-center">
      <CircularProgress size="6rem" />
    </div>
  )
}

export default GenNewDocView
