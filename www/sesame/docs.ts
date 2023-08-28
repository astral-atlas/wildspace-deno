import { h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { DocSheet } from "../../modules/ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../../modules/ComponentDoc/markdown.ts";
import { SesamePage } from "./SesamePage.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { FramePresenter } from "../../modules/ComponentDoc/FramePresenter.ts";

const demos = {
  page() {
    return h(FramePresenter, {}, [
      h(SesamePage)
    ]);
  }
}

export const sesameDocs: DocSheet[] = [
  markdownToSheet('Sesame', readme, demos)
]