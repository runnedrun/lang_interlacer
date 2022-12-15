import { BehaviorSubject, Observable, OperatorFunction } from "rxjs"
import { Cache } from "./builders/buildCachedSwitchMap"
import { CustomLoadingBuildObsFn } from "./builders/buildParamterizedObs"

type Zip<A extends ReadonlyArray<any>> = {
  [K in keyof A]: A[K] extends ReadonlyArray<infer T> ? T : never
}

// type mapp = <Y extends { [key: string]: Promise<any> }>(l: Y) => { [key in keyof Y]: Observable<Y>[]
// const mapit: mapp = (l) => Object.values(l).map((_) => from(_))

// const r = mapit([Promise.resolve(1), Promise.resolve("hohoh")])

export type KeyType = string | number | symbol
type ValueType = any
type ArgsMap = { [key: string]: ValueType }
export type AttachFunctionType<I extends ArgsMap, T, N extends KeyType> = (
  args: Partial<I>
) => ParamaterizedObservable<I, T, N>

export type DataWithLoading<
  M extends any,
  ArgsType extends Record<string, any>
> = {
  args: Partial<ArgsType>
  finalValue?: M
  isLoading: boolean
  metadata: Record<string, any>
}

export type AttachObsFunctionType<OD, OR, ON extends KeyType> = <
  D1 extends ArgsMap,
  R1 extends string,
  N1 extends keyof OD,
  D2 extends ArgsMap,
  R2 extends string,
  N2 extends keyof OD
>(
  ...obs: [
    ParamaterizedObservable<D1, R1, N1>,
    ParamaterizedObservable<D2, R2, N2>?
  ]
) => ParamaterizedObservable<Omit<OD, N1 | N2> & D1 & D2, OR, ON>

export type CacheSpecification = {
  cache: Record<string, any>
  // getValueFromCache?: (args: ArgsType) => T
  // updateCache: (args: Partial<ArgsType>, update: T) => void
}

export const isParameterizedObservable = (
  arg: any
): arg is ParamaterizedObservable<any, any, any> => {
  return !!(arg as ParamaterizedObservable<any, any, any>)?.attach
}

type Pipes<T extends any, ParamType extends ArgsMap, Name extends KeyType> = {
  pipe<A>(
    op1: OperatorFunction<T, A>
  ): ParamaterizedObservable<ParamType, A, Name>
  pipe<A, B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): ParamaterizedObservable<ParamType, B, Name>
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): ParamaterizedObservable<ParamType, C, Name>
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): ParamaterizedObservable<ParamType, D, Name>
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): ParamaterizedObservable<ParamType, E, Name>
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): ParamaterizedObservable<ParamType, F, Name>
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): ParamaterizedObservable<ParamType, G, Name>
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): ParamaterizedObservable<ParamType, H, Name>
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): ParamaterizedObservable<ParamType, I, Name>
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ParamType, unknown, Name>
  pipe(
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ParamType, any, Name>
}

type PipesWithLoading<
  T extends any,
  ParamType extends ArgsMap,
  Name extends KeyType
> = {
  pipeWithLoading<A>(
    op1: OperatorFunction<
      DataWithLoading<T, ParamType>,
      DataWithLoading<A, ParamType>
    >
  ): ParamaterizedObservable<ParamType, A, Name>
  pipeWithLoading<A, B>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, DataWithLoading<B, ParamType>>
  ): ParamaterizedObservable<ParamType, B, Name>
  pipeWithLoading<A, B, C>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, DataWithLoading<C, ParamType>>
  ): ParamaterizedObservable<ParamType, C, Name>
  pipeWithLoading<A, B, C, D>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, DataWithLoading<D, ParamType>>
  ): ParamaterizedObservable<ParamType, D, Name>
  pipeWithLoading<A, B, C, D, E>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, DataWithLoading<E, ParamType>>
  ): ParamaterizedObservable<ParamType, E, Name>
  pipeWithLoading<A, B, C, D, E, F>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, DataWithLoading<F, ParamType>>
  ): ParamaterizedObservable<ParamType, F, Name>
  pipeWithLoading<A, B, C, D, E, F, G>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, DataWithLoading<G, ParamType>>
  ): ParamaterizedObservable<ParamType, G, Name>
  pipeWithLoading<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, DataWithLoading<H, ParamType>>
  ): ParamaterizedObservable<ParamType, H, Name>
  pipeWithLoading<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, DataWithLoading<I, ParamType>>
  ): ParamaterizedObservable<ParamType, I, Name>
  pipeWithLoading<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<DataWithLoading<T, ParamType>, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ParamType, unknown, Name>
  pipeWithLoading(
    ...operations: OperatorFunction<any, any>[]
  ): ParamaterizedObservable<ParamType, any, Name>
}

export type ParamaterizedObservable<
  ParamType extends ArgsMap,
  T,
  Name extends KeyType
> = Omit<Observable<T>, "pipe"> & {
  attach: AttachFunctionType<ParamType, T, Name>
  getWithArgs: (newArgs: Partial<ParamType>) => Promise<T>
  name: Name
  withName<NewName extends KeyType>(
    newName: NewName
  ): ParamaterizedObservable<ParamType, T, NewName>
  originalArgs: ParamType
  getCurrentParams: () => ParamType
  getRawParams: () => any
  obs: () => Observable<T>
  then: <ReturnType>(handler: (arg0: T) => ReturnType) => PromiseLike<any>
  build: CustomLoadingBuildObsFn<any, T, ParamType>
  observableParams: Observable<Partial<ParamType>>
  log: (
    overrideLabel?: string,
    overrideMessage?: (value: T) => any
  ) => ParamaterizedObservable<ParamType, T, Name>
  logIf: (
    conditional: boolean,
    overrideLabel?: string,
    overrideMessage?: (value: T) => any
  ) => ParamaterizedObservable<ParamType, T, Name>
  clone: () => ParamaterizedObservable<ParamType, T, Name>
  cloneWithCaching: (
    argTransformFn?: (args: ParamType) => any,
    alwaysReadFromCache?: boolean
  ) => ParamaterizedObservable<ParamType, T, Name>
  cacheBehaviorSubject: BehaviorSubject<Record<string, any>>
  isLoadingForArgsObs: Observable<DataWithLoading<T, ParamType>>
} & Pipes<T, ParamType, Name> &
  PipesWithLoading<T, ParamType, Name>
