import { DocSheet } from "../../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../../ComponentDoc/markdown.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';

export const serviceCommonDocs: DocSheet[] = [
  markdownToSheet('ServiceCommon', readme)
]