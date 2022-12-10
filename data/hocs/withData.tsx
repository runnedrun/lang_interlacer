import React, { useEffect, useState } from "react"
import { ArgsMap } from "../builders/ArgsMap"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import { log } from "@/helpers/logPObs"

export const withData = <AllProps extends Object>(
  Component: React.FunctionComponent<AllProps>
) => <
  D1 extends ArgsMap,
  Name1 extends keyof AllProps,
  R1,
  D2 extends ArgsMap,
  Name2 extends keyof AllProps,
  R2,
  D3 extends ArgsMap,
  Name3 extends keyof AllProps,
  R3,
  D4 extends ArgsMap,
  Name4 extends keyof AllProps,
  R4,
  AllInputs extends D1 & D2 & D3 & D4,
  AllNames extends Name1 | Name2 | Name3 | Name4,
  AllResults extends R1 | R2 | R3 | R4
>(
  ...args: [
    ParamaterizedObservable<D1, R1, Name1>?,
    ParamaterizedObservable<D2, R2, Name2>?,
    ParamaterizedObservable<D3, R3, Name3>?,
    ParamaterizedObservable<D4, R4, Name4>?
  ]
) => ({ dataInput, ...rest }: Partial<AllProps> & { dataInput: AllInputs }) => {
  type ResultType = { [key in AllNames]: AllResults }
  const [data, setData] = useState<ResultType>()

  useEffect(() => {
    args.forEach((obs) => {
      obs?.attach && obs?.attach(dataInput)
    })
  }, [dataInput])

  useEffect(() => {
    const offList = args.map(
      (obs: ParamaterizedObservable<any, any, any> | undefined) => {
        return obs
          ?.subscribe((value) => {
            const update = {} as ResultType
            update[obs.name as keyof ResultType] = value
            setData((oldData) => ({ ...oldData, ...update }))
          })
          .unsubscribe.bind(obs)
      }
    )

    return () => offList.forEach((_) => _ && _())
  }, [])

  return <Component {...data} {...((rest as unknown) as AllProps)} />
}
