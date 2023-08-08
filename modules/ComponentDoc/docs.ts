import { DocSheet } from "./DocElement.ts";
import { markdownToDoc } from "./markdown.ts";
// @deno-types="vite-text" 
import readme from './readme.md?raw';

const DocSiteDemo = () => {
  return 'Cool demo bro!';
}

const demos = {
  'docsite': DocSiteDemo
}

export const componentDocDocs: DocSheet[] = [
  {
    id: "ComponentDoc",
    elements: [
      markdownToDoc(readme, demos)
    ],
  },
];
