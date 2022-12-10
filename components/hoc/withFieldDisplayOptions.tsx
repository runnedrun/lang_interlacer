import {
  FieldDisplayOptions,
  FieldDisplayOptionsContext,
} from "../FieldDisplayOptionsContext"
import { withContext } from "./withContext"

export const withFieldDisplayOptions = <ComponentProps extends any>(
  WrappedComponent: React.ComponentType<ComponentProps>,
  options: FieldDisplayOptions
) => withContext(WrappedComponent, FieldDisplayOptionsContext, options)
