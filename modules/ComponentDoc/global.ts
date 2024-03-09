import { actMarkdown, act } from "./deps.ts";
import { DocSheet } from "./DocElement.ts";
import { urlSheet } from './markdown.ts';

export type DocOptions = {
  id: string,
  readmeURL: URL,
  directiveComponents?: actMarkdown.ComponentMap<actMarkdown.MarkdownDirectiveComponentProps>,
  parentId?: string,
  parent?: act.Component
}

export const doc = (options: DocOptions) => {
  const sheet = urlSheet(
    options.id,
    options.readmeURL,
    options.directiveComponents || {},
    options.parent,
    options.parentId
  );
  globalSheets.push(sheet);
};

export const globalSheets: DocSheet[] = [];
