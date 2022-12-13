import {
  buildStringEnumSelector,
  getFromStringEnum,
} from "@/components/hoc/buildEnumSelector"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { EditingState, fbWriter } from "@/data/firebaseObsBuilders/fbWriter"
import { settable } from "@/data/paramObsBuilders/settable"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { DocumentJob } from "@/data/types/DocumentJob"
import { Language } from "@/data/types/RawParagraph"
import { buildErrorOrLabelText } from "@/page_helpers/mui/buildErrorOrLabelText"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { Timestamp } from "@firebase/firestore"
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import Link from "next/link"
import React from "react"

const TranslationDescription = ({
  generateTranslation,
}: {
  generateTranslation: boolean
}) => {
  return generateTranslation ? (
    <div>
      {`Just paste in the original text below and we'll translate it for you, then interlace it with the original.`}
    </div>
  ) : (
    <div>
      Paste in the original and the translation for the text that you want to
      interlace.
    </div>
  )
}

const LanguageSelector = buildStringEnumSelector(Language, {
  inputLabel: "Target Language",
  renderLabel: (_) => _,
})

const MAX_TEXT_LENGTH = 10000

const dataFunc = () => {
  const jobObs = docForKey("documentJob", stringParam("docJobKey"))
  const writer = fbWriter("documentJob", jobObs, {
    editingStateOverride: settable(
      "editingStateOverride",
      EditingState.Editing
    ),
    beforeWrite: ({ baseData, data, setError, errors }) => {
      if (data.lang1Text?.length > MAX_TEXT_LENGTH) {
        setError("lang1Text", "Text is too long")
      } else if (!data.lang1Text?.length) {
        setError("lang1Text", "Please enter some text")
      }

      if (!data.generateTranslation) {
        if (data.lang2Text?.length > MAX_TEXT_LENGTH) {
          setError("lang2Text", "Text is too long")
        } else if (!data.lang2Text?.length) {
          setError("lang2Text", "Please enter some text")
        }
      }

      if (data.generateTranslation && !data.targetLanguage) {
        setError("targetLanguage", "Please select a target language")
      }

      return data
    },
    modifyWrite: ({ data }) => {
      if (!data.startJob) {
        data.startJob = Timestamp.now()
      }
      return data
    },
  })
  return { ...writer }
}

type StepCompleteFn = (docJob: DocumentJob) => Boolean

const stepsForProgress: StepCompleteFn[] = [
  (docJob) => {
    return !!docJob.lang1Sentences
  },
  (docJob) => {
    return !!docJob.lang2Sentences
  },
  (docJob) => {
    return !!docJob.jobCompletedAt
  },
]

const JobProgressBar = ({ docJob }: { docJob: DocumentJob }) => {
  const stepsComplete = stepsForProgress.filter((step) => step(docJob)).length
  const progress = (stepsComplete / stepsForProgress.length) * 100

  const text =
    progress === 100 ? (
      <Link href={`/doc/${docJob.uid}`} passHref>
        <div className="underline hover:text-blue-400">
          Done! Click here to see results.
        </div>
      </Link>
    ) : (
      <div className="text-xs">Processing, may take a few minutes...</div>
    )

  return (
    <div className="w-64">
      {text}
      <LinearProgress variant="determinate" value={progress} />
    </div>
  )
}

const NewDocView = component(
  dataFunc,
  ({
    updateField,
    writeResults: { currentData, errors },
    setEditingStateOverride,
  }) => {
    const jobStarted = !!currentData.startJob

    console.log("has", errors)

    const bottomBar = (
      <div className="flex justify-end gap-4 flex-wrap items-center">
        {jobStarted && <JobProgressBar docJob={currentData} />}
        <Button
          disabled={errors.hasError || jobStarted}
          variant="contained"
          onClick={() => setEditingStateOverride(EditingState.Saved)}
        >
          Submit Job
        </Button>
      </div>
    )

    return (
      <div className="w-full flex justify-center">
        <div className="w-2/3 justify-center max-w-3xl">
          <div className="text-5xl mt-5 text-center">Language Interlacer</div>
          <div className="gap-5 flex flex-col w-full p-5">
            <div className="flex flex-col items-center mb-5">
              <div className="flex mb-5">
                <FormControl disabled={jobStarted}>
                  <ToggleButtonGroup
                    color="primary"
                    value={!!currentData.generateTranslation}
                    exclusive
                    onChange={(_, value) =>
                      updateField("generateTranslation", value)
                    }
                    aria-label="Platform"
                  >
                    <ToggleButton value={false}>
                      Use my translation
                    </ToggleButton>
                    <ToggleButton value={true}>Translate for me</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </div>
              <div className="max-w-sm">
                <div className="text-sm p-2 mb-3">
                  <TranslationDescription
                    generateTranslation={currentData.generateTranslation}
                  ></TranslationDescription>
                </div>
                <div>
                  {currentData.generateTranslation && (
                    <div>
                      {errors.byKey["targetLanguage"] && (
                        <div className="text-error-400">
                          {errors.byKey["targetLanguage"].message}
                        </div>
                      )}
                      <LanguageSelector
                        update={(_) => {
                          console.log("update", Language[_])
                          updateField("targetLanguage", Language[_])
                        }}
                        value={getFromStringEnum(
                          Language,
                          currentData.targetLanguage
                        )}
                        disabled={jobStarted}
                      ></LanguageSelector>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full mb-10">
              <FormControl
                className="w-full"
                disabled={jobStarted}
                error={!!errors.byKey.lang1Text}
              >
                <InputLabel htmlFor="lang1-input">
                  {buildErrorOrLabelText(
                    "Language 1",
                    errors.byKey,
                    "lang1Text"
                  )}
                </InputLabel>
                <FormHelperText id="lang1-helper-text">
                  {`Paste in up to 10,000 characters of text in any language`}
                </FormHelperText>
                <Input
                  id="lang1-input"
                  aria-describedby="lang1-helper-text"
                  multiline
                  className="w-full"
                  value={currentData.lang1Text}
                  onChange={(e) => updateField("lang1Text", e.target.value)}
                />
              </FormControl>
            </div>
            {!currentData.generateTranslation && (
              <div className="w-full">
                <FormControl
                  className="w-full"
                  disabled={jobStarted}
                  error={!!errors.byKey.lang2Text}
                >
                  <InputLabel htmlFor="lang2-input">
                    {buildErrorOrLabelText(
                      "Language 2",
                      errors.byKey,
                      "lang2Text"
                    )}
                  </InputLabel>
                  <FormHelperText id="lang2-helper-text">
                    {`Paste the translation of the text above in any other language`}
                  </FormHelperText>
                  <Input
                    id="lang2-input"
                    aria-describedby="lang2-helper-text"
                    multiline
                    className="w-full"
                    value={currentData.lang2Text}
                    onChange={(e) => updateField("lang2Text", e.target.value)}
                  />
                </FormControl>
              </div>
            )}
            {bottomBar}
          </div>
        </div>
      </div>
    )
  }
)

export const getServerSideProps = buildPrefetchHandler(dataFunc)

export default NewDocView
