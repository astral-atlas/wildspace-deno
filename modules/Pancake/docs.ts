import { DocSheet, urlSheet } from "../ComponentDoc/mod.ts";

export const pancakeDocs: DocSheet[] = [
  urlSheet('Pancake', new URL('./readme.md', import.meta.url)),
  urlSheet('Shapes', new URL('./shapes/readme.md', import.meta.url), {}, null, 'Pancake')
];
