// @deno-types="vite-css"
import docSiteStyles from "./DocSite.module.css";

import {
  ComponentMap, MarkdownDirectiveComponentProps, MarkdownASTRenderer, parseMarkdown, MarkdownNode, MarkdownNodeProps,
  // @ts-ignore It totally exists guys I promise
  MarkdownHeading
} from "https://esm.sh/@lukekaalim/act-markdown@1.8.1";
import { DocElement, DocSheet } from "./DocElement.ts";
import { Component, h, useMemo } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { useAsync } from "../ActCommon/mod.ts";

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
  parent: null | Component = null,
  parentId: null | string = null,
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
    parentId,
    id,
    elements: [
      {
        type: 'rich',
        richElement: parent ? h(parent, {}, h(DocComponent)) : h(DocComponent)
      }
    ]
  };
}

export const quickSheet = (
  id: string,
  markdownContent: string,
  parentId?: string,
): DocSheet => {

  const DocComponent = () => {
    const ast = useMemo(() =>  parseMarkdown(markdownContent), [])

    return h(MarkdownASTRenderer, {
      root: ast,
      externalComponents
    });
  };

  return {
    parentId,
    id,
    elements: [
      { type: 'rich', richElement: h(DocComponent) }
    ]
  }
}

export const urlSheet = (
  id: string,
  markdownURL: URL, 
  directiveComponents: ComponentMap<MarkdownDirectiveComponentProps> = {},
  parent: null | Component = null,
  parentId: null | string = null,
): DocSheet => {

  const DocComponent = () => {
    const markdownContent = useAsync(() =>
      fetch(markdownURL.href).then(f => f.text()), [markdownURL]);

      if (!markdownContent)
        return null;
  
    const ast = parseMarkdown(markdownContent);

    return h(MarkdownASTRenderer, {
      root: ast,
      directiveComponents,
      externalComponents
    });
  };

  return {
    parentId,
    id,
    elements: [
      {
        type: 'rich',
        richElement: parent
          ? h(parent, {}, h(DocComponent))
          : h(DocComponent)
      }
    ]
  }
}