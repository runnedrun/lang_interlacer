import { CountdownType } from "./countdownType"
import { Join } from "./Join"

export type Leaves<T, Separator extends string = ".", D extends number = 5> = [
  D
] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: Join<
        K,
        Leaves<T[K], Separator, CountdownType[D]>,
        Separator
      >
    }[keyof T]
  : ""
