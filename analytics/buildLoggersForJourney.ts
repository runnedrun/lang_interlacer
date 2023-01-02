import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { getAnalytics, logEvent } from "firebase/analytics"
import { init } from "@/data/initFb"
import { isDemoMode } from "@/helpers/isDemoMode"

export type JourneyStep<DataSchema = Record<any, any>> = {
  optional?: boolean
  once?: boolean
  schema?: DataSchema
}

export const buildOptions = <DataSchema = Record<any, any>>(
  options: JourneyStep<DataSchema>
) => {
  options
}

export type JourneyExtraMethods<DataType> = {
  attachJourneyData: (dataToAttach: Partial<DataType>) => void
}

export type Journey<
  Steps extends Record<string, JourneyStep>,
  JourneyGlobalDataType extends Record<any, any>
> = {
  [key in keyof Steps]: (extraData?: Steps[key]["schema"]) => void
} &
  JourneyExtraMethods<JourneyGlobalDataType>

export const buildLoggersForJourney = <
  Steps extends Record<string, JourneyStep>,
  JourneyGlobalDataType extends Record<any, any>,
  JourneyType extends Journey<Steps, JourneyGlobalDataType>
>(
  journeyName: string,
  extraDataSchema: JourneyGlobalDataType,
  journey: Steps
): JourneyType => {
  const journeyData = {} as JourneyGlobalDataType
  const buildLogger = (name: keyof Steps, options: JourneyStep) => {
    let triggerCount = 0

    return ((extraData: Record<any, any>) => {
      const dataToLog = { ...extraData, ...journeyData }
      const fullEventName = `${journeyName}.${String(name)}`
      if (isServerside()) return

      if (triggerCount > 0 && options.once) return

      if (isDemoMode()) {
        console.debug(`EVENT: ${fullEventName}`, dataToLog)
      } else {
        init()
        const analytics = getAnalytics()
        logEvent(analytics, String(fullEventName), dataToLog)
      }

      triggerCount++
    }) as JourneyType[typeof name]
  }

  const loggers = {
    attachJourneyData: (data: JourneyGlobalDataType) => {
      Object.assign(journeyData, { ...extraDataSchema, ...data })
    },
  } as JourneyType

  objKeys(journey).forEach((stepName) => {
    loggers[stepName] = buildLogger(stepName, journey[stepName])
  })

  return loggers
}
