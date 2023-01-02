import { Logger } from "./Logger"

export const withLogger = <ArgsForHandler, ArgsForLgoger>(
  logger?: Logger<ArgsForLgoger>,
  argsForLoggerOrHandleFunc?:
    | ArgsForLgoger
    | ((...args: ArgsForHandler[]) => any),
  handleFunc?: (...args: ArgsForHandler[]) => any
): ((args: ArgsForHandler) => any) => {
  return (...args) => {
    let handler =
      handleFunc ||
      (argsForLoggerOrHandleFunc as (...args: ArgsForHandler[]) => any)

    const loggerArgs = handleFunc ? argsForLoggerOrHandleFunc : {}
    logger && logger(loggerArgs as ArgsForLgoger)
    handler(...args)
  }
}
