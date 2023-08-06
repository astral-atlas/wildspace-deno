import { h, Component } from "https://esm.sh/v126/@lukekaalim/act@2.6.0";
import { DocElement } from "./DocElement.ts";
import { FrameSchedulerProvider } from "../FrameScheduler/FrameSchedulerContext.ts";
import { defaultFrameSchedulerOptions } from "../FrameScheduler/FrameScheduler.ts";

export type DocPageProps = {
  elements: DocElement[],
}

export const DocPage: Component<DocPageProps> = ({ elements }) => {
  return h('article', {}, h(FrameSchedulerProvider, { options: defaultFrameSchedulerOptions }, elements.map(element => {
    switch (element.type) {
      case 'title':
        return h('h2', {}, element.text);
      case 'paragraph':
        return h('p', {}, element.text);
      case 'component':
        return h(element.component);
      case 'rich':
        return element.richElement;
      default:
        return null;
    }
  })))
}