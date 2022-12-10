export const withClassname = <ComponentProps extends any>(
  WrappedComponent: React.ComponentType<ComponentProps>,
  className: string
) => (props: ComponentProps) => (
  <div className={className}>
    <WrappedComponent {...props}></WrappedComponent>
  </div>
)
