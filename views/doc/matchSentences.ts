import { Sentence } from "@/data/types/RawParagraph"
import { BeamSearch } from "./BeamSearch"
import { Matrix, matrix, multiply, transpose } from "mathjs"

type Node = {
  score?: number
  lang1: { start: number; end: number }
  lang2: { start: number; end: number }
}

const getSentencesInNode = (node: Node) => {
  return node.lang1.end - node.lang1.start + node.lang2.end - node.lang2.start
}

export const matchSentences = (
  lang1Sentences: Sentence[],
  lang2Sentences: Sentence[],
  lookForwardSize: number = 2
): Node[] => {
  const scoreNode = (
    node: Node,
    similarityMatrix: Matrix,
    logLabel: string
  ) => {
    let additiveScore = 0
    const scores = []
    for (
      let lang1Index = node.lang1.start;
      lang1Index < node.lang1.end;
      lang1Index++
    ) {
      for (
        let lang2Index = node.lang2.start;
        lang2Index < node.lang2.end;
        lang2Index++
      ) {
        const newScore = similarityMatrix.get([
          lang1Index - node.lang1.start,
          lang2Index - node.lang2.start,
        ])
        scores.push(newScore)

        additiveScore += newScore
      }
    }

    const totalMatches =
      (node.lang1.end - node.lang1.start) * (node.lang2.end - node.lang2.start)

    const averageScore = additiveScore / Math.pow(totalMatches, 1)

    return averageScore
  }

  const calculateSimilarityMatrix = (
    lang1Sentences: Sentence[],
    lang2Sentences: Sentence[]
  ) => {
    const lang1Embeddings = lang1Sentences.map((_) => _.embedding)
    const lang2Embeddings = lang2Sentences.map((_) => _.embedding)
    const lang1Matrix = matrix(lang1Embeddings)
    const lang2Matrix = matrix(lang2Embeddings)

    return multiply(lang1Matrix, transpose(lang2Matrix))
  }

  const genChildrenNodeForStartIndices = (
    lang1StartIndex: number,
    lang2StartIndex: number
  ): Node[] => {
    const allPossibleCombinations = [] as Node[]
    for (
      let lang1Index = lang1StartIndex + 1;
      lang1Index <=
      Math.min(lang1Sentences.length, lang1StartIndex + 1 + lookForwardSize);
      lang1Index++
    ) {
      for (
        let lang2Index = lang2StartIndex + 1;
        lang2Index <=
        Math.min(lang2Sentences.length, lang2StartIndex + 1 + lookForwardSize);
        lang2Index++
      ) {
        allPossibleCombinations.push({
          lang1: { start: lang1StartIndex, end: lang1Index },
          lang2: { start: lang2StartIndex, end: lang2Index },
        })
      }
    }

    return allPossibleCombinations
  }

  const beam = new BeamSearch({
    childrenGenerator: ({ path }: { path: Node[] }) => {
      const prevNode = path[path.length - 1]
      const scoreSoFar = prevNode?.score || null
      const lang1StartIndex = prevNode?.lang1?.end || 0
      const lang2StartIndex = prevNode?.lang2?.end || 0

      const allPossibleLang1Sentences = lang1Sentences.slice(
        lang1StartIndex,
        lookForwardSize + 1 + lang1StartIndex
      )

      const allPossibleLang2Sentences = lang2Sentences.slice(
        lang2StartIndex,
        lookForwardSize + 1 + lang2StartIndex
      )

      const childrenNodes = genChildrenNodeForStartIndices(
        lang1StartIndex,
        lang2StartIndex
      )

      const similarityMatrix = calculateSimilarityMatrix(
        allPossibleLang1Sentences,
        allPossibleLang2Sentences
      )

      const newPaths = childrenNodes.map((node) => {
        const pathLengthSoFar = path.length
        const newScore = scoreNode(
          node,
          similarityMatrix,
          `(${node.lang1.start}, ${node.lang1.end}), (${node.lang2.start}, ${node.lang2.end})`
        )
        const nNewSentences = getSentencesInNode(node)
        const sentencesSoFar = node.lang1.start + node.lang2.start

        node.score =
          (newScore * nNewSentences + scoreSoFar * sentencesSoFar) /
          (nNewSentences + sentencesSoFar)
        return { path: [...path, node] }
      })

      return newPaths
    },
    solutionValidator: ({ path }) => {
      const lastNode = path[path.length - 1]

      const isValid =
        lastNode.lang1.end === lang1Sentences.length ||
        lastNode.lang2.end === lang2Sentences.length

      return isValid
    },
    childrenComparator: (pathA, pathB) => {
      const scoreForNodeA = pathA.path[pathA.path.length - 1].score!
      const scoreForNodeB = pathB.path[pathB.path.length - 1].score!
      const scoreComp = scoreForNodeB! - scoreForNodeA!
      return scoreComp
    },
    width: {
      initial: 10,
    },
  })

  const paths = beam
    .searchFrom({ path: [] })
    .sort(
      ({ path: pathsA }, { path: pathsB }) =>
        pathsB[pathsB.length - 1].score! - pathsA[pathsA.length - 1].score!
    )

  return paths[0].path
}
