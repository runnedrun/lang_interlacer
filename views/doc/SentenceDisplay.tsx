import { Sentence } from "@/data/types/RawParagraph"
import classNames from "classnames"

export const SentenceDisplay = ({
  sentence,
  onClick = () => {},
  isSelected = false,
}: {
  sentence: Sentence
  onClick?: () => void
  isSelected?: boolean
}) => {
  return (
    sentence?.text && (
      <span
        onClick={() => {
          onClick()
        }}
        className={classNames("ml-1", { "font-bold": isSelected })}
      >
        {sentence.text}
      </span>
    )
  )
}
