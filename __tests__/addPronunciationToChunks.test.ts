import { Language, Sentence } from "../data/types/RawParagraph"
import { getPronunciationForSentences } from "../functions/src/helpers/addPronunciationToChunks"

const sentences: Sentence[] = [
  {
    embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 0,
    text:
      "四月のある晴れた朝、原宿の裏通りで僕は100パーセントの女の子とすれ違う。",
  },
  {
    embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 1,
    text: "たいして綺麗な女の子ではない。",
  },
]

// Get pronunciation of sentences from kuroshiro online demo
// https://kuroshiro.org/#demo
const results: Sentence[] = [
  {
    embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 0,
    text:
      "しがつのあるはれたあさ、はらじゅくのうらどおりでぼくは100パーセントのおんなのことすれちがう。",
  },
  {
    embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 1,
    text: "たいしてきれいなおんなのこではない。",
  },
]

test("checks pronunciation of Japanese text", async () => {
  await expect(
    getPronunciationForSentences(Language.Japanese, sentences)
  ).resolves.toStrictEqual(results)
})
