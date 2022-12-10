import { objHasUndef } from "@/helpers/filterUndef"
import { mountOnceAndIgnore } from "@/helpers/mountOnceAndIgnore"
import { objKeys } from "@/helpers/objKeys"
import { clone, isEqual, isUndefined } from "lodash"
import {
  BehaviorSubject,
  filter,
  map,
  pairwise,
  startWith,
  tap,
  withLatestFrom,
} from "rxjs"
import { ForeignKey } from "../baseTypes/ForeignKey"
import { obsToNamedParamObs } from "../builders/obsToNamedParamObs"
import { creators, setters } from "../fb"
import {
  isParameterizedObservable,
  ParamaterizedObservable,
} from "../ParamaterizedObservable"
import { combine } from "../paramObsBuilders/combine"
import { ValueTypeFromParamObs } from "../paramObsBuilders/ParamObsTypeUtils"
import { CollectionModels } from "./CollectionModels"

type KeyError = {
  message: string
}

type ErrorType<DataType extends Record<string, any>> = {
  byKey?: Partial<Record<keyof DataType, KeyError>>
  overallError?: string
  hasError: boolean
}

type WriteResultsType<DataType extends Record<string, any>> = {
  errors: ErrorType<DataType>
  isEditing: boolean
}

type SetErrorFn<DataType extends Record<string, any>> = (
  keyName: keyof DataType,
  error: KeyError | string
) => void

type BeforeWrite<DataType extends Record<string, any>> = (args: {
  data: DataType
  baseData: DataType
  setError: SetErrorFn<DataType>
  errors: ErrorType<DataType>
}) => DataType

export enum EditingState {
  Editing,
  Saved,
  Cancelled,
}

const isKeyError = (
  errorOrString: string | KeyError
): errorOrString is KeyError => {
  return typeof errorOrString === "object"
}

export const fbWriter = <
  CollectionNameType extends keyof CollectionModels,
  BaseValueType extends CollectionModels[CollectionNameType],
  BaseValueParamObs extends ParamaterizedObservable<any, BaseValueType, any>,
  EditingStateOverrideArgs extends Record<string, any> = {}
>(
  collectionName: CollectionNameType,
  baseValueObs: BaseValueParamObs,
  options: {
    beforeWrite?: BeforeWrite<BaseValueType>
    afterWrite?: (data: BaseValueType, dataBeforeWrite: BaseValueType) => void
    autoSave?: boolean
    onCreate?: (arg: {
      id: ForeignKey<CollectionNameType>
      clearEditingData: () => void
    }) => void
    editingStateOverride?: ParamaterizedObservable<
      EditingStateOverrideArgs,
      EditingState,
      any
    >
  } = {}
) => {
  const editinStateSubject =
    options.editingStateOverride || new BehaviorSubject(EditingState.Cancelled)
  const dataToWriteSubject = new BehaviorSubject(undefined as BaseValueType)

  const remoteUpdatePipeToSubject = baseValueObs.pipe(
    startWith(undefined as BaseValueType),
    withLatestFrom(
      editinStateSubject.pipe(startWith(undefined as EditingState))
    ),
    pairwise(),
    filter(([prev, current], i) => {
      const oldBaseValue = prev[0]
      const newBaseValue = current[0]
      const currentEditingState = current[1]

      return (
        !isEqual(oldBaseValue, newBaseValue) &&
        (currentEditingState !== EditingState.Editing || i == 0)
      )
    }),
    map(([prev, current]) => current[0]),
    tap((baseValue) => {
      dataToWriteSubject.next(baseValue)
    })
  )

  const editingStateParamObs = isParameterizedObservable(editinStateSubject)
    ? editinStateSubject
    : obsToNamedParamObs(editinStateSubject, "editingState")

  const resetDataToWriteOnCancelObs = editingStateParamObs.pipe(
    startWith(undefined as EditingState),
    withLatestFrom(baseValueObs.pipe(startWith(undefined as BaseValueType))),
    pairwise(),
    tap(([[prevEditingState], [currentEditingState, baseValue]]) => {
      if (
        !isUndefined(prevEditingState) &&
        prevEditingState !== EditingState.Cancelled &&
        currentEditingState === EditingState.Cancelled
      ) {
        dataToWriteSubject.next(baseValue)
      }
    })
  )

  const writeResultsObs = combine({
    editingState: editingStateParamObs,
    dataToWrite: obsToNamedParamObs(dataToWriteSubject, "dataToWrite"),
  }).pipe(
    withLatestFrom(baseValueObs),
    startWith([
      {
        editingState: undefined as EditingState,
        dataToWrite: undefined as BaseValueType,
      },
      undefined as BaseValueType,
    ] as const),
    map(([{ editingState, dataToWrite }, baseValue]) => {
      return [editingState, dataToWrite, baseValue as BaseValueType] as const
    }),
    pairwise(),
    map(([prev, current]) => {
      const prevState = prev[0]
      const currentState = current[0]
      const currentDataToWrite = current[1]

      const baseData = current[2] || ({} as BaseValueType)

      const updatedDataToWrite = { ...baseData, ...currentDataToWrite }

      const errors = { byKey: {} } as ErrorType<BaseValueType>

      const setError = (
        keyName: keyof BaseValueType,
        error: KeyError | string
      ) => {
        if (isKeyError(error)) {
          errors.byKey[keyName] = error
        } else {
          errors.byKey[keyName] = { message: error }
        }
      }

      const toWriteClone = clone(updatedDataToWrite)

      const beforeWrite = options.beforeWrite || (() => toWriteClone)

      const processedToWrite = beforeWrite({
        data: toWriteClone,
        baseData: baseData,
        setError,
        errors,
      })

      errors.hasError = !!errors.overallError || !!objKeys(errors.byKey).length

      const editingComplete =
        currentState === EditingState.Saved &&
        prevState === EditingState.Editing

      const timeToSave = editingComplete || options.autoSave

      return {
        errors: errors,
        data: processedToWrite,
        isEditing: currentState === EditingState.Editing,
        editingState: currentState,
        isCreate: !baseData,
        dataBeforeWrite: baseData,
        shouldWrite: !errors.hasError && !!processedToWrite && timeToSave,
      }
    }),
    tap(async (dataAndErrors) => {
      if (dataAndErrors.shouldWrite) {
        const uid = dataAndErrors.data.uid
        const cleanForWrite = { ...dataAndErrors.data }
        delete cleanForWrite["hydrated"]
        delete cleanForWrite["uid"]

        if (dataAndErrors.isCreate && options.onCreate) {
          const newDataRef = await creators[collectionName](
            cleanForWrite as any
          )
          dataToWriteSubject.next({
            ...dataToWriteSubject.getValue(),
            uid: newDataRef.id,
          })
          options.onCreate({
            id: newDataRef.id as ForeignKey<CollectionNameType>,
            clearEditingData: () => {
              dataToWriteSubject.next({} as BaseValueType)
            },
          })
        } else {
          await setters[collectionName](uid, cleanForWrite as any)
        }
        options.afterWrite
          ? options.afterWrite(
              dataAndErrors.data,
              dataAndErrors.dataBeforeWrite
            )
          : null
      }
    }),
    map((dataAndErrors) => {
      return {
        editingState: dataAndErrors.editingState,
        data: dataAndErrors.data,
        errors: dataAndErrors.errors,
        isEditing: dataAndErrors.isEditing,
      }
    })
  )

  const baseDataAndWriteResultsObs = combine({
    baseValue: baseValueObs,
    writeResults: writeResultsObs,
  })
    .pipe(
      mountOnceAndIgnore(remoteUpdatePipeToSubject),
      filter((values) => !objHasUndef(values)),
      map(({ baseValue, writeResults }) => {
        const currentData = writeResults.data

        return {
          errors:
            writeResults.errors ||
            ({ hasError: false } as ErrorType<BaseValueType>),
          isEditing: writeResults.isEditing,
          baseData: baseValue,
          currentData: currentData as ValueTypeFromParamObs<BaseValueParamObs>,
          editingState: writeResults.editingState,
        }
      })
    )
    .pipe(mountOnceAndIgnore(resetDataToWriteOnCancelObs))

  return {
    writeResults: baseDataAndWriteResultsObs,
    setEditingState: (editingState: EditingState) => {
      isParameterizedObservable(editinStateSubject)
        ? console.log(
            "The editing state subject is overridden, set the value directly using the override."
          )
        : editinStateSubject.next(editingState)
    },
    update(dataToWrite: Partial<BaseValueType>) {
      dataToWriteSubject.next({
        ...dataToWriteSubject.getValue(),
        ...dataToWrite,
      })
    },
    updateField(fieldName: keyof BaseValueType, value: any) {
      dataToWriteSubject.next({
        ...dataToWriteSubject.getValue(),
        [fieldName]: value,
      })
    },
  }
}
