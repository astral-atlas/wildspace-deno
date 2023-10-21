import { h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';

import starURL from './drawing.svg';
import stars from './drawing.svg?raw';

const SVG = () => {
  return [
    h('img', { src: starURL })
  ]
}

export const journalDocs: DocSheet[] = [
  markdownToSheet('Journal', readme, { SVG })
];