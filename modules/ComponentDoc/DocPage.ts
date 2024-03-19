import { act } from "./deps.ts";
import { DocElement } from "./DocElement.ts";
import { FrameSchedulerProvider } from "../FrameScheduler/FrameSchedulerContext.ts";
import { defaultFrameSchedulerOptions } from "../FrameScheduler/FrameScheduler.ts";

const { h } = act;

export type DocPageProps = {
  elements: DocElement[],
}

export const DocPage: act.Component<DocPageProps> = ({ elements }) => {
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