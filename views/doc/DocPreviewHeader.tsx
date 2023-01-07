import { setters } from "@/data/fb"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { prop } from "@/data/paramObsBuilders/prop"
import { settable } from "@/data/paramObsBuilders/settable"
import { Language } from "@/data/types/RawParagraph"
import { Timestamp } from "@firebase/firestore"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import { Button, FormControlLabel, Switch } from "@mui/material"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import * as React from "react"
import { component } from "../view_builder/component"

export const DocPreviewHeader = component(
  () => {
    const docJob = docForKey("documentJob", prop("docKey"))
    const languages = prop("languages", undefined as Language[])
    return {
      docJob,
      languages,
      selectedTab: settable("selectedTab", "1"),
    }
  },
  ({
    docJob: { settings = {}, uid },
    languages,
    selectedTab,
    setSelectedTab,
  }) => {
    const onChange = (_, newValue) => {
      setSelectedTab(newValue)
    }

    let pronunciationSwitchText: string = "Show pronunciation"
    if (languages.includes(Language.Chinese)) {
      pronunciationSwitchText += " (pinyin)"
    } else if (languages.includes(Language.Japanese)) {
      pronunciationSwitchText += " (furigana)"
    }

    return (
      <div className="w-full flex">
        <div className="flex-grow">
          <TabContext value={selectedTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={onChange} aria-label="lab API tabs example">
                <Tab label="Language Options" value="1" />
                <Tab label="Layout Options" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <div className="flex flex-wrap">
                <FormControlLabel
                  control={
                    <Switch
                      onChange={(_, value) => {
                        setters.documentJob(uid, {
                          settings: {
                            ...settings,
                            showPronunciation: value,
                          },
                        })
                      }}
                      checked={!!settings.showPronunciation}
                    />
                  }
                  label={pronunciationSwitchText}
                />
              </div>
            </TabPanel>
            <TabPanel value="2">Item Two</TabPanel>
          </TabContext>
        </div>
        <div>
          <Button
            onClick={() => {
              setters.documentJob(uid, {
                triggerEpubCreation: Timestamp.now(),
              })
            }}
            variant="contained"
          >
            Generate Epub
          </Button>
        </div>
      </div>
    )
  }
)
