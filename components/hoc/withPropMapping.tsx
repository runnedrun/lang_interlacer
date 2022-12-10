export const withPropMapping = <ComponentProps extends Record<string, any>>(
  WrappedComponent: React.ComponentType<ComponentProps>
) => <PropName extends keyof ComponentProps>(
  propName: PropName,
  mappingFn: (props: ComponentProps) => ComponentProps[PropName]
) => (props: Omit<ComponentProps, PropName>) => {
  const newPropsFromMappingFns = { ...props } as ComponentProps
  newPropsFromMappingFns[propName] = mappingFn(props as any)

  return <WrappedComponent {...newPropsFromMappingFns}></WrappedComponent>
}
