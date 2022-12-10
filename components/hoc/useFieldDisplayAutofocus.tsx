import React from "react"
import { useContext, useEffect } from "react"
import { FieldDisplayOptionsContext } from "../FieldDisplayOptionsContext"

export const useFieldDisplayAutofocus = () => {
  const fieldDisplayOptions = useContext(FieldDisplayOptionsContext)
  const [elToFocus, setElToFocus] = React.useState<HTMLElement | null>()

  useEffect(() => {
    setTimeout(() => {
      fieldDisplayOptions.autoFocus && elToFocus && elToFocus.focus()
    })
  }, [elToFocus])

  return React.useCallback((el: HTMLElement | null) => {
    setElToFocus(el)
  }, [])
}
