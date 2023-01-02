export const generateRawParagraphKey = (
  docKey: string,
  languageId: string,
  paragraphIndex: number
) => {
  return `${docKey}-${languageId}-${paragraphIndex}`
}
