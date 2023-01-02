import { setters } from "@/data/fb"
import { generateRawParagraphKey } from "@/functions/src/helpers/generateRawParagraphKey"
import { Timestamp } from "@firebase/firestore"
import { Button } from "@mui/material"

const prepEnglishChineseTestRawParagraphAndDoc = () => {
  const testDocKey = "test-1"
  setters.documentJob(testDocKey, {
    createdAt: Timestamp.now(),
    archived: false,
  })

  const lang1ParagraphId = generateRawParagraphKey(testDocKey, "1", 0)

  setters.rawParagraph(lang1ParagraphId, {
    chunkIndex: 0,
    docKey: testDocKey,
    language: "1",
    sentences: [
      {
        embedding: [0.6, 0.7, 0.8],
        sentenceIndex: 0,
        text: "Testing 123.",
      },
      {
        embedding: [0.6, 0.7, 0.8],
        sentenceIndex: 1,
        text: "Hello World.",
      },
    ],
  })

  // 他在向一个⻓相严肃的女人微笑，那个女 人戴的眼镜的形状与那只猫眼睛周围的花纹一模一样

  const lang2ParagraphId = generateRawParagraphKey(testDocKey, "2", 0)

  setters.rawParagraph(lang2ParagraphId, {
    chunkIndex: 0,
    docKey: testDocKey,
    language: "2",
    sentences: [
      {
        embedding: [0.6, 0.7, 0.8],
        sentenceIndex: 0,
        text:
          "他在向一个⻓相严肃的女人微笑，那个女 人戴的眼镜的形状与那只猫眼睛周围的花纹一模一样",
      },
      {
        embedding: [0.6, 0.7, 0.8],
        sentenceIndex: 1,
        text: "很高兴⻅到你，⻨康娜教授。",
      },
    ],
  })
}

const PrepDataView = () => {
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          prepEnglishChineseTestRawParagraphAndDoc()
        }}
      >
        English to Chinese
      </Button>
    </div>
  )
}

export default PrepDataView
