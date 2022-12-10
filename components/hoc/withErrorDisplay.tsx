import { Error } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material"
import { red } from "@mui/material/colors"

const ErrorTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: red[400],
    color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))

export const withErrorDisplay = <Props extends any>(
  EditableComponent: React.ComponentType<Props>
) => {
  return (props: Props & { error?: Error }) => {
    const error = props.error

    return (
      <ErrorTooltip
        color="error"
        open={!!error}
        title={error?.message || "Error"}
        placement="bottom"
      >
        <div className="w-fit">
          <EditableComponent {...props}></EditableComponent>
        </div>
      </ErrorTooltip>
    )
  }
}
