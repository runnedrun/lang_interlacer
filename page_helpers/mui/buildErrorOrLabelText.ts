import { KeyError } from "@/data/firebaseObsBuilders/fbWriter"

export const buildErrorOrLabelText = (
  mainLabelText: string,
  error: KeyError
) => {
  return error ? error.message : mainLabelText
}
