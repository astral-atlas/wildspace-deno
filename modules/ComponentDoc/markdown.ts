// @deno-types="vite-css"
import docSiteStyles from "./DocSite.module.css";

import {
  act,
  actMarkdown
} from "./deps.ts";
import { DocElement, DocSheet } from "./DocElement.ts";
import { Component, h, useMemo } from "@lukekaalim/act";
import { useAsync } from "../ActCommon/mod.ts";
import { EventRecordProvider } from "./EventList.ts";
import { useSmoothHashScroll } from "./useSmoothHashScroll.ts";
import { navigationContext } from "@lukekaalim/act-navigation";

const {
  MarkdownASTRenderer, parseMarkdown,
  // @ts-ignore It totally exists guys I promise
  MarkdownHeading
} = actMarkdown;

export const markdownToDoc = (
  markdownText: string,
  directiveComponents: actMarkdown.ComponentMap<actMarkdown.MarkdownDirectiveComponentProps>
): DocElement => {
  const ast = parseMarkdown(markdownText);

  const DocComponent = () => {
    return h(MarkdownASTRenderer, { root: ast, directiveComponents });
  };
  return { type: 'rich', richElement: h(DocComponent) };
}

const LinkHeading: Component<actMarkdown.MarkdownNodeProps> = ({ node }) => {
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
  directiveComponents: actMarkdown.ComponentMap<actMarkdown.MarkdownDirectiveComponentProps> = {},
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
  directiveComponents: actMarkdown.ComponentMap<actMarkdown.MarkdownDirectiveComponentProps> = {},
  parent: null | Component = null,
  parentId: null | string = null,
): DocSheet => {

  const DocComponent = () => {
    const markdownContent = useAsync(() =>
      fetch(markdownURL.href).then(f => f.text()), [markdownURL]);

    if (!markdownContent)
      return null;


    // since content is not known until after the async,
    // we need to retry the scrolling

    const ref = act.useRef(null);
    const nav = act.useContext(navigationContext);
    if (!nav)
      return null;

    useSmoothHashScroll(ref, nav);
  
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
        richElement: h(EventRecordProvider, {}, parent
          ? h(parent, {}, h(DocComponent))
          : h(DocComponent)
        )
      }
    ]
  }
}