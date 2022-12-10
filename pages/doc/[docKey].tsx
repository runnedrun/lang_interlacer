import { filtered } from "@/data/paramObsBuilders/filtered"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { RawParagraph } from "@/data/types/RawParagraph"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"

// const SentDisplay = (props: { sent: string }) => {
//   return <div className="mb-3">{props.sent}</div>
// }

// const ParagraphDisplay = (props: {
//   enParagraph: RawParagraph
//   foreignParagraph: RawParagraph
// }) => {
//   return (
//     <div>
//       {props.enParagraph.sentences.map((sent, i) => {
//         return <SentDisplay key={i} sent={sent.text} />
//       })}
//     </div>
//   )
// }

const dataFunc = memoizeDataFunc((renderId: string) => {
  return {
    enParagraphs: filtered("rawParagraph", {
      // docKey: stringParam("docKey"),
      // language: staticValue("en"),
    }),
    zhParagraphs: filtered("rawParagraph", {
      docKey: stringParam("docKey"),
      // language: staticValue("zh"),
    }),
  }
})

const DocDisplay = component(dataFunc, ({ enParagraphs, zhParagraphs }) => {
  console.log("props", enParagraphs, zhParagraphs)
  return <div>hi</div>
  // return (
  // <div className="flex justify-center">
  //   <div className="flex max-w-6xl gap-5">
  //     <div className="max-w-xl">
  //       {props.enSentencesSplit.map((paragraph, i) => (
  //         <ParagraphDisplay paragraph={paragraph} key={i}></ParagraphDisplay>
  //       ))}
  //     </div>

  //     <div className="max-w-2xl">
  //       {props.zhSentencesSplit.map((paragraph, i) => {
  //         return (
  //           <ParagraphDisplay
  //             paragraph={paragraph}
  //             key={i}
  //           ></ParagraphDisplay>
  //         )
  //       })}
  //     </div>
  //   </div>
  // </div>
  // )
})

// export const getServerSideProps = async () => {

//   return {
//     props: {
//       enSentencesSplit: enSentencesSplit.results.paragraphs,
//       zhSentencesSplit: zhSentencesSplit.results.paragraphs,
//     },
//   }
// }

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default DocDisplay
