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
  // @ts-ignore
  {
    // does not return embedding data
    // embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 0,
    text:
      "<ruby>四月<rp>(</rp><rt>しがつ</rt><rp>)</rp></ruby>のある<ruby>晴<rp>(</rp><rt>は</rt><rp>)</rp></ruby>れた<ruby>朝<rp>(</rp><rt>あさ</rt><rp>)</rp></ruby>、<ruby>原宿<rp>(</rp><rt>はらじゅく</rt><rp>)</rp></ruby>の<ruby>裏通<rp>(</rp><rt>うらどお</rt><rp>)</rp></ruby>りで<ruby>僕<rp>(</rp><rt>ぼく</rt><rp>)</rp></ruby>は100パーセントの<ruby>女<rp>(</rp><rt>おんな</rt><rp>)</rp></ruby>の<ruby>子<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>とすれ<ruby>違<rp>(</rp><rt>ちが</rt><rp>)</rp></ruby>う。",
  },
  // @ts-ignore
  {
    // does not return embedding data
    // embedding: [0.6, 0.7, 0.8],
    sentenceIndex: 1,
    text:
      "たいして<ruby>綺麗<rp>(</rp><rt>きれい</rt><rp>)</rp></ruby>な<ruby>女<rp>(</rp><rt>おんな</rt><rp>)</rp></ruby>の<ruby>子<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>ではない。",
  },
]

test("checks pronunciation of Japanese text", async () => {
  await expect(
    getPronunciationForSentences(Language.Japanese, sentences)
  ).resolves.toStrictEqual(results)
})
