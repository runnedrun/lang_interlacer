import { LoginBar } from "@/components/controls/LoginBar"
import {
  buildStringEnumSelector,
  getFromStringEnum,
} from "@/components/hoc/buildEnumSelector"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { EditingState, fbWriter } from "@/data/firebaseObsBuilders/fbWriter"
import { prop } from "@/data/paramObsBuilders/prop"
import { settable } from "@/data/paramObsBuilders/settable"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { DocumentJob } from "@/data/types/DocumentJob"
import { Language } from "@/data/types/RawParagraph"
import { DocTextInputs } from "@/views/new_doc/DocTextInputs"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { Timestamp } from "@firebase/firestore"
import {
  Button,
  FormControl,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material"
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth"
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
      } else if (!data.lang1Text?.length && !data.lang1File?.url) {
        setError("lang1Text", "Please enter some text")
      }

      if (!data.generateTranslation) {
        if (data.lang2Text?.length > MAX_TEXT_LENGTH) {
          setError("lang2Text", "Text is too long")
        } else if (!data.lang2Text?.length && !data.lang2File?.url) {
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
  return { ...writer, userId: prop("userId", undefined as string) }
}

type StepCompleteFn = (docJob: DocumentJob) => Boolean

const stepsForProgress: StepCompleteFn[] = [
  (docJob) => {
    return !!docJob.lang1SentenceFile
  },
  (docJob) => {
    return !!docJob.lang2SentenceFile
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
      <div className="underline hover:text-blue-400">
        <a href={`/doc/${docJob.uid}`}>Done! Click here to see results.</a>
      </div>
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
    userId,
  }) => {
    const jobStarted = !!currentData.startJob

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
        <div className="md:w-2/3 md:p-0 px-2 justify-center max-w-3xl">
          <LoginBar userId={userId} />
          <div className="text-5xl mt-5 text-center">Language Interlacer</div>
          <div className="gap-5 flex flex-col w-full p-5">
            <div className="flex flex-col items-center mb-5">
              <div className="flex mb-5">
                <FormControl disabled={jobStarted}>
                  <Tooltip
                    title={
                      userId
                        ? ""
                        : "Anonymous users can only use their own translation. Sign in or create an account to use our translation."
                    }
                  >
                    <ToggleButtonGroup
                      color={userId ? "primary" : "standard"}
                      value={!!currentData.generateTranslation}
                      exclusive
                      onChange={(_, value) =>
                        updateField("generateTranslation", value)
                      }
                      disabled={userId ? false : true}
                      aria-label="Platform"
                    >
                      <ToggleButton value={false}>
                        Use my translation
                      </ToggleButton>
                      <ToggleButton value={true}>Translate for me</ToggleButton>
                    </ToggleButtonGroup>
                  </Tooltip>
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
            <DocTextInputs
              currentData={currentData}
              errors={errors}
              header={`Paste in up to 10,000 characters of text in any language`}
              updateField={updateField}
              langNumber={1}
              userId={userId}
            ></DocTextInputs>

            {!currentData.generateTranslation && (
              <DocTextInputs
                currentData={currentData}
                errors={errors}
                header={`Paste the translation of the text above in any other language`}
                updateField={updateField}
                langNumber={2}
                userId={userId}
              ></DocTextInputs>
            )}
            {bottomBar}
          </div>
        </div>
      </div>
    )
  }
)

export const getServerSideProps = withAuthUserTokenSSR()(async (context) => {
  const { props } = (await buildPrefetchHandler(dataFunc)(context)) as any
  return { props: { ...props, userId: context.AuthUser.id } }
})

export default withAuthUser({ whenUnauthedBeforeInit: AuthAction.SHOW_LOADER })(
  NewDocView
)
