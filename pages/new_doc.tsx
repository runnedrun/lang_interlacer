import { creators } from "@/data/fb"
import { useEffect } from "react"

const GenNewDocView = () => {
  useEffect(() => {
    creators.documentJob({}).then((ref) => {
      window.location.href = `/new_doc/${ref.id}`
    })
  }, [])

  return <div>One moment...</div>
}

export default GenNewDocView
