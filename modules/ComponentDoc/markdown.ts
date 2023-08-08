import { ComponentMap, MarkdownASTRenderer, parseMarkdown } from "https://esm.sh/@lukekaalim/act-markdown@1.6.0";
import { DocElement, DocSheet } from "./DocElement.ts";
import { h } from "https://esm.sh/@lukekaalim/act@2.6.0";

export const markdownToDoc = (markdownText: string, directiveComponents: ComponentMap): DocElement => {
  const ast = parseMarkdown(markdownText);

  const DocComponent = () => {
    return h(MarkdownASTRenderer, { root: ast, directiveComponents });
  };
  return { type: 'rich', richElement: h(DocComponent) };
}

export const markdownToSheet = (
  id: string,
  markdownText: string,
  directiveComponents: ComponentMap
): DocSheet => {
  const ast = parseMarkdown(markdownText);

  const DocComponent = () => {
    return h(MarkdownASTRenderer, { root: ast, directiveComponents });
  };
  
  return {
    id,
    elements: [
      { type: 'rich', richElement: h(DocComponent) }
    ]
  };
}