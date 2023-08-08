import { h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";

// @deno-types="vite-text" 
import readmeText from './README.md?raw';
import { BigTable } from "./BigTable.ts";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { randomElement, randomIntRange, repeat } from "../RandomThingGenerator/random.ts";


const BigTableDemo = () => {
  const columns = ['ID', 'Name', 'AC'];
  const rows = repeat(() => [
    randomElement(['Sword', 'King', 'Battle', 'Sneaky', 'Legged', 'Bard']),
    randomElement(['Elf', 'Dwarf', 'Boy', 'Lizard', 'Cat', 'Girl']),
  ].join(''), randomIntRange(100, 200))
    .map((name, index) => [index.toString(), name, randomIntRange(10, 22).toString()]);

  return h(FramePresenter, {}, [
    h(BigTable, { columns, rows })
  ]);
};

export const bigTableDocs: DocSheet[] = [
  markdownToSheet('BigTable', readmeText, {
    bigtabledemo: BigTableDemo
  })
];