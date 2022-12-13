import { Sentence } from "@/data/types/RawParagraph"
import classNames from "classnames"

export const SentenceDisplay = ({
  sentence,
  onClick,
  isSelected,
}: {
  sentence: Sentence
  onClick: () => void
  isSelected: boolean
}) => {
  return (
    <div
      onClick={() => {
        onClick()
      }}
      className={classNames("ml-2", { "font-bold": isSelected })}
    >
      {sentence.text}
    </div>
  )
}
