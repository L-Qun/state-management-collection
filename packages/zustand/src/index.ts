import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";

type Subscribe = Parameters<typeof useSyncExternalStoreWithSelector>[0];

type GetState<T> = () => T;

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>)
) => void;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe;
};

type StateCreator<T> = (setState: SetState<T>) => T;

const createStore = <T>(createState: StateCreator<T>): StoreApi<T> => {
  const listeners = new Set<() => void>();
  let state: T;
  const setState: SetState<T> = (partial) => {
    const nextState =
      typeof partial === "function"
        ? (partial as (state: T) => T)(state)
        : partial;
    if (!Object.is(nextState, state)) {
      state =
        typeof nextState !== "object" || nextState === null
          ? (nextState as T)
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener());
    }
  };
  const getState = () => state;
  const subscribe: Subscribe = (subscribe) => {
    listeners.add(subscribe);
    return () => listeners.delete(subscribe);
  };
  const api = { setState, getState, subscribe };
  state = createState(setState);
  return api;
};

const useStore = <State, StateSlice>(
  api: StoreApi<State>,
  selector: (state: State) => StateSlice = api.getState as any,
  equalityFn: (a: StateSlice, b: StateSlice) => boolean
) => {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getState,
    selector,
    equalityFn
  );
  return slice;
};

export const create = <T>(createState: StateCreator<T>) => {
  const api = createStore(createState);
  const useBoundStore = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
