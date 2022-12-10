export const withContext = <
  ComponentProps extends any,
  ContextType extends any
>(
  WrappedComponent: React.ComponentType<ComponentProps>,
  Context: React.Context<ContextType>,
  contextValue: ContextType
) => (props: ComponentProps) => (
  <Context.Provider value={contextValue}>
    <WrappedComponent {...props}></WrappedComponent>
  </Context.Provider>
)
