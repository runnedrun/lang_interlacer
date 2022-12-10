export const withPropsOverride = <ComponentProps extends Record<string, any>>(
  WrappedComponent: React.ComponentType<ComponentProps>
) => <PropsOverrideType extends Partial<ComponentProps>>(
  propsOverride: PropsOverrideType
) => (props: Omit<ComponentProps, keyof PropsOverrideType>) => (
  <WrappedComponent
    {...({ ...props, ...propsOverride } as ComponentProps)}
  ></WrappedComponent>
)
