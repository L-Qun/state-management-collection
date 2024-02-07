#!/usr/bin/env npx tsx

import { add, complete, cycle, save, suite } from "benny";
import { PrimitiveAtom, atom } from "../src/atom";

import { createStore } from "../src/store";

const createStateWithAtoms = (n: number) => {
  let targetAtom: PrimitiveAtom<number> | null = null;
  const store = createStore();
  for (let i = 0; i < n; ++i) {
    const a = atom(i);
    if (!targetAtom) {
      targetAtom = a;
    }
    store.set(a, i);
  }
  if (!targetAtom) {
    throw new Error();
  }
  return [store, targetAtom] as const;
};

const suiteCases = [2, 3, 4, 5, 6].map((n) =>
  add(`atoms=${10 ** n}`, () => {
    const [store, targetAtom] = createStateWithAtoms(10 ** n);
    return () => store.get(targetAtom);
  })
);

const main = async () => {
  await suite(
    "simple-read",
    ...suiteCases,
    cycle(),
    complete(),
    save({
      folder: __dirname,
      file: "simple-read",
      format: "json",
    }),
    save({
      folder: __dirname,
      file: "simple-read",
      format: "chart.html",
    })
  );
};

main();
