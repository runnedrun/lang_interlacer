import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { prop } from "@/data/paramObsBuilders/prop"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { map } from "rxjs"
import { component } from "../view_builder/component"
import TabContext from "@mui/lab/TabContext"

import * as React from "react"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import { settable } from "@/data/paramObsBuilders/settable"
import { Button, FormControlLabel, Switch } from "@mui/material"
import { DocumentJob } from "@/data/types/DocumentJob"
import { setters } from "@/data/fb"
import { Timestamp } from "@firebase/firestore"

export const DocPreviewHeader = component(
  () => {
    const docJob = docForKey("documentJob", prop("docKey"))
    return {
      docJob,
      selectedTab: settable("selectedTab", "1"),
    }
  },
  ({ docJob: { settings = {}, uid }, selectedTab, setSelectedTab }) => {
    console.log("settings", settings)
    const onChange = (_, newValue) => {
      setSelectedTab(newValue)
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
                  label="Show Pronunciation (ja, zh)"
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
