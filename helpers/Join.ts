export type Join<K, P, Separator extends string = "."> = K extends
  | string
  | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : Separator}${P}`
    : never
  : never
