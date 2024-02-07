// import { WritableAtom } from "src/atom";
// import { Store } from "src/store";

// type AnyWritableAtom = WritableAtom<unknown, any[], any>;

// type InferAtomTuples<T> = {
//   [K in keyof T]: T[K] extends readonly [infer A, unknown]
//     ? A extends WritableAtom<unknown, infer Args, any>
//       ? readonly [A, Args[0]]
//       : T[K]
//     : never;
// };

// const hydratedMap: WeakMap<Store, WeakSet<AnyWritableAtom>> = new WeakMap();

// function getHydratedSet(store: Store) {
//   let hydratedSet = hydratedMap.get(store);
//   if (!hydratedSet) {
//     hydratedSet = new WeakSet();
//     hydratedMap.set(store, hydratedSet);
//   }
//   return hydratedSet;
// }

// export function useHydrateAtoms<
//   T extends Array<readonly [AnyWritableAtom, unknown]>,
// >(values: InferAtomTuples<T>, options?: { store: Store }) {
//   const store = useStore(options);
//   const hydratedSet = getHydratedSet(store);
//   for (const [atom, value] of values) {
//     if (!hydratedSet.has(atom)) {
//       store.set(atom, value);
//       hydratedSet.add(atom);
//     }
//   }
// }
