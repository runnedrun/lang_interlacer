import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { component } from "@/views/view_builder/component"
import { buildSetKey } from "@/views/view_builder/getInputsAndValuesFromMapToResolve"
import { SingleEditableFieldComponent } from "./buildDataGridForFieldDisplays"

export const buildControlledEditableComponentFromObs = <
  ArgsType extends Record<string, any>,
  ArgName extends string,
  ModelType extends any
>(
  obsFn: (
    renderId: string
  ) => ParamaterizedObservable<ArgsType, ModelType, any>,
  argName: keyof ArgsType,
  ControlComponent: SingleEditableFieldComponent<ArgsType[ArgName]>,
  options = {} as Omit<SingleFieldEditableProps<ModelType>, "value" | "update">
) => {
  return component(
    (renderId) => ({ data: obsFn(renderId) }),
    ({ data, ...controlsAndSetters }) => {
      const currentValue = controlsAndSetters[argName as any]
      const currentValueSetter =
        controlsAndSetters[buildSetKey(argName as string) as any]
      return (
        <ControlComponent
          update={currentValueSetter}
          value={currentValue}
          {...options}
        ></ControlComponent>
      )
    }
  )
}
