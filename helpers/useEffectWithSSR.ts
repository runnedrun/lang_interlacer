import { useEffect, useRef } from "react"
import { isServerside } from "./isServerside"

export const useEffectWithSSR = (
  fnToRun: (...any) => any,
  dependencies: any[]
) => {
  const hasCompletedInitialRun = useRef(false)
  const hasCompletedInitialEffect = useRef(false)
  const unsub = useRef(() => {})
  if (isServerside()) {
    const unsub = fnToRun()
    unsub && unsub()
  } else {
    if (!hasCompletedInitialRun.current) {
      unsub.current = fnToRun()
      hasCompletedInitialRun.current = true
      if (dependencies.length) {
        unsub.current && unsub.current()
      }
    }

    useEffect(() => {
      if (hasCompletedInitialEffect.current) {
        unsub.current = fnToRun()
      }
      hasCompletedInitialEffect.current = true
      return () => {
        unsub.current && unsub.current()
      }
    }, dependencies)
  }
}
