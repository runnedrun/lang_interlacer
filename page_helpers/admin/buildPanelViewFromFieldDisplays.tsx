import { AnyGenericModel } from "@/data/baseTypes/Model"
import { isFieldDisplay } from "@/data/fieldDisplayComponents/isFieldDisplay"
import { ValueFromArrayParamObsFn } from "@/data/paramObsBuilders/ParamObsTypeUtils"
import { component } from "@/views/view_builder/component"
import {
  LazyLoadComponent,
  trackWindowScroll,
} from "react-lazy-load-image-component"
import { comparatorsByType } from "./buildColumnDef"
import {
  buildDocumentDisplayFromFieldDisplays,
  DocumentDisplayBuilder,
} from "./buildDocumentDisplayFromFieldDisplays"

export const buildPanelViewFromFieldDisplays: DocumentDisplayBuilder<{}> = (
  collectionName,
  dataObsFn
) => (adminDisplaySpec, options) => {
  const Component = buildDocumentDisplayFromFieldDisplays<
    typeof collectionName,
    ValueFromArrayParamObsFn<typeof dataObsFn>
  >(collectionName)(adminDisplaySpec, options)

  const placeholder = <div className="h-96"></div>

  return component(
    (renderId) => ({
      data: dataObsFn(renderId),
    }),
    ({ data }) => {
      const typed = data as AnyGenericModel[]

      if (options.defaultSort) {
        const colName = options.defaultSort.column
        const fieldDisplay = adminDisplaySpec[colName]
        if (isFieldDisplay(fieldDisplay)) {
          const colType = fieldDisplay.type
          const comparator = comparatorsByType[colType]
          const sortDirectionMultiplier =
            options.defaultSort.direction === "asc" ? 1 : -1

          const valueGetter = fieldDisplay.components.getter
          typed.sort((aRow, bRow) => {
            const aCol = valueGetter(aRow as any)
            const bCol = valueGetter(bRow as any)
            return comparator(aCol, bCol) * sortDirectionMultiplier
          })
        }
      }

      const list = ({ scrollPosition }) => (
        <div className="flex w-full flex-col items-center p-5">
          {typed.map((doc) => {
            return (
              <div
                key={doc.uid}
                className="mb-5 w-full max-w-6xl rounded-md outline-1 outline outline-defaultOutline pt-2 lg:w-2/3"
              >
                <LazyLoadComponent
                  scrollPosition={scrollPosition}
                  placeholder={placeholder}
                >
                  <Component
                    doc={doc as ValueFromArrayParamObsFn<typeof dataObsFn>}
                  ></Component>
                </LazyLoadComponent>
              </div>
            )
          })}
        </div>
      )
      const Tracked = trackWindowScroll(list)
      return <Tracked />
    }
  )
}
