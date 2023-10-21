// @deno-types="vite-css"
import docSiteStyles from "./DocSite.module.css";

import {
  ComponentMap, MarkdownDirectiveComponentProps, MarkdownASTRenderer, parseMarkdown, MarkdownNode, MarkdownNodeProps,
  // @ts-ignore It totally exists guys I promise
  MarkdownHeading
} from "https://esm.sh/@lukekaalim/act-markdown@1.8.1";
import { DocElement, DocSheet } from "./DocElement.ts";
import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

export const markdownToDoc = (
  markdownText: string,
  directiveComponents: ComponentMap<MarkdownDirectiveComponentProps>
): DocElement => {
  const ast = parseMarkdown(markdownText);

  const DocComponent = () => {
    return h(MarkdownASTRenderer, { root: ast, directiveComponents });
  };
  return { type: 'rich', richElement: h(DocComponent) };
}

const DefaultParentComponent: Component = ({ children }) => {
  return children
};

const LinkHeading: Component<MarkdownNodeProps> = ({ node }) => {
  const data = (node.data || {}) as Record<string, unknown>;
  const id = data.id as string;
  if (id)
    return h('div', {},
      h('a', { href: `#${id}`, class: docSiteStyles.headingLink },
        h(MarkdownHeading, { node })));

  return h(MarkdownHeading, { node });
}

const externalComponents = {
  'heading': LinkHeading,
}

export const markdownToSheet = (
  id: string,
  markdownText: string,
  directiveComponents: ComponentMap<MarkdownDirectiveComponentProps> = {},
  parent: Component = DefaultParentComponent,
): DocSheet => {
  const ast = parseMarkdown(markdownText);

  const DocComponent = () => {
    return h(MarkdownASTRenderer, {
      root: ast,
      directiveComponents,
      externalComponents
    });
  };
  
  return {
    id,
    elements: [
      { type: 'rich', richElement: h(parent, {}, h(DocComponent)) }
    ]
  };
}