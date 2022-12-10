import { BoxProps } from "@mui/material"
import { Box } from "@mui/system"

export const withBoxWrapper = <ComponentProps extends any>(
  WrappedComponent: React.ComponentType<ComponentProps>,
  wrapperProps: BoxProps
) => (props: ComponentProps) => (
  <Box {...wrapperProps}>
    <WrappedComponent {...props}></WrappedComponent>
  </Box>
)
