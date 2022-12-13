import { SelectedSentence } from "@/pages/doc/[docKey]"
import { dot } from "mathjs"

export const CompareSelectedSentencesDisplay = ({
  selection: [selection1, selection2] = [],
}: {
  selection: SelectedSentence[]
}) => {
  if (!selection1 || !selection2) {
    return <div></div>
  }

  const score = dot(selection1.emedding, selection2.emedding)
  return <div className="text-bold">ScoreFromSelected: {score}</div>
}
