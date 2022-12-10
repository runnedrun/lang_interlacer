import { obsToNamedParamObs } from "@/data/builders/obsToNamedParamObs"
import { isUndefined } from "@/helpers/isUndefined"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { BehaviorSubject, filter } from "rxjs"

const cachedQueryObs = new BehaviorSubject(
  undefined as Record<string, string | string[]>
)

export const queryObsCacheName = "queryObs"
export const getQueryObs = () =>
  obsToNamedParamObs(
    cachedQueryObs.pipe(filter((_) => !isUndefined(_))),
    queryObsCacheName
  ).cloneWithCaching()

export const useQueryObsWithEffect = () => {
  const router = useRouter()
  cachedQueryObs.next(router.query)
  useEffect(() => {
    cachedQueryObs.next(router.query)
  }, [router.query])
  return cachedQueryObs
}
