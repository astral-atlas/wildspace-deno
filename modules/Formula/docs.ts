import { h, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { LabeledTextInput } from "./LabeledInput.ts";

const LabeledInputDemo = () => {
  const [text, setText] = useState('My initial text');
  return h(FramePresenter, { height: `200px` }, [
    h(LabeledTextInput, { value: text, onInput: setText, label: 'Text' })
  ]);
}

const demos = {
  'LabeledInputDemo': LabeledInputDemo
};

export const formulaDocs: DocSheet[] = [
  markdownToSheet('Formula', readme, demos)
]