import {
  buildEnumSelector,
  buildStringEnumSelector,
} from "@/components/hoc/buildEnumSelector"
import {
  buildComponentsForField,
  buildCustomEditableComponents,
} from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { EditingState, fbWriter } from "@/data/firebaseObsBuilders/fbWriter"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { DocumentJob } from "@/data/types/DocumentJob"
import { Language } from "@/data/types/RawParagraph"
import { buildControlledEditableComponentFromObs } from "@/page_helpers/admin/buildControlledEditableComponentFromObs"
import { buildDocumentDisplayFromFieldDisplays } from "@/page_helpers/admin/buildDocumentDisplayFromFieldDisplays"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { Timestamp } from "@firebase/firestore"
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Select,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import React, { useState } from "react"
import { map } from "rxjs"

const TranslationDescription = ({
  provideTranslation,
}: {
  provideTranslation: boolean
}) => {
  return provideTranslation ? (
    <div>Paste in the translation for the text that you want to interlace.</div>
  ) : (
    <div>
      {`Just paste in the original text below and we'll translate it for you, then interlace it with the original.`}
    </div>
  )
}

const LanguageSelector = buildStringEnumSelector(Language, {
  renderLabel: (_) => Language[_],
  inputLabel: "Target Language",
})

// const dataFunc = () => {
//   const writer = fbWriter("documentJob", jobObs, {
//     autoSave: true,
//     editingStateOverride: staticValue(EditingState.Editing),
//   })
//   return { ...writer }
// }

const DocDisplayComponent = buildDocumentDisplayFromFieldDisplays<
  "documentJob",
  DocumentJob
>("documentJob")(
  {
    "Choose a job type": {
      components: buildCustomEditableComponents(
        "provideTranslation",
        ({ update, value }) => {
          return (
            <FormControl disabled={disabled}>
              <ToggleButtonGroup
                color="primary"
                value={value}
                exclusive
                onChange={(_, value) => update(value)}
                aria-label="Platform"
              >
                <ToggleButton value={true}>I have a translation</ToggleButton>
                <ToggleButton value={false}>
                  I want you to Translate for me
                </ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
          )
        },
        ({ row }) => {
          return <div>{row.provideTranslation}</div>
        }
      ),
    },
    "Choose a language": {},
  },
  {}
)

const NewDocView = component(
  () => {
    return {
      docJob: docForKey("documentJob", stringParam("docJobKey")),
    }
  },
  ({ docJob }) => {
    return <DocDisplayComponent doc={docJob}></DocDisplayComponent>
  }
)

// const NewDocView = component(
//   dataFunc,
//   ({ updateField, writeResults: { currentData } }) => {
//     const disabled = !!currentData.startJob

//     return (
//       <div className="w-full flex justify-center">
//         <div className="w-2/3 justify-center max-w-3xl">
//           <div className="gap-5 flex flex-col w-full p-5">
//             <div>
// <FormControl disabled={disabled}>
//   <ToggleButtonGroup
//     color="primary"
//     value={currentData.provideTranslation}
//     exclusive
//     onChange={(_, value) =>
//       updateField("provideTranslation", value)
//     }
//     aria-label="Platform"
//   >
//     <ToggleButton value={true}>I have a translation</ToggleButton>
//     <ToggleButton value={false}>
//       I want you to Translate for me
//     </ToggleButton>
//   </ToggleButtonGroup>
// </FormControl>
//               <div className="text-sm p-2">
//                 <TranslationDescription
//                   provideTranslation={currentData.provideTranslation}
//                 ></TranslationDescription>
//               </div>
//               {!currentData.provideTranslation && (
//                 <div>
//                   <LanguageSelector
//                     update={(_) => {
//                       updateField("targetLanguage", _)
//                     }}
//                     value={Language[currentData.targetLanguage]}
//                     disabled={disabled}
//                   ></LanguageSelector>
//                 </div>
//               )}
//             </div>

//             <div className="w-full mb-10">
//               <FormControl className="w-full" disabled={disabled}>
//                 <InputLabel htmlFor="lang1-input">Language 1</InputLabel>
//                 <FormHelperText id="lang1-helper-text">
//                   {`Paste in up to 10,000 characters of text in any language`}
//                 </FormHelperText>
//                 <Input
//                   id="lang1-input"
//                   aria-describedby="lang1-helper-text"
//                   multiline
//                   className="w-full"
//                   value={currentData.lang1Text}
//                   onChange={(e) => updateField("lang1Text", e.target.value)}
//                 />
//               </FormControl>
//             </div>
//             {currentData.provideTranslation && (
//               <div className="w-full">
//                 <FormControl className="w-full" disabled={disabled}>
//                   <InputLabel htmlFor="lang1-input">Language 1</InputLabel>
//                   <FormHelperText id="lang1-helper-text">
//                     {`Paste the translation of the text above in any other language`}
//                   </FormHelperText>
//                   <Input
//                     id="lang1-input"
//                     aria-describedby="lang1-helper-text"
//                     multiline
//                     className="w-full"
//                     value={currentData.lang2Text}
//                     onChange={(e) => updateField("lang1Text", e.target.value)}
//                   />
//                 </FormControl>
//               </div>
//             )}
//           </div>
//           <div className="flex justify-end">
//             <Button
//               variant="contained"
//               onClick={() => updateField("startJob", Timestamp.now())}
//             >
//               Submit Job
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }
// )

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default NewDocView
