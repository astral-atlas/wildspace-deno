import { DocSheet } from "../ComponentDoc/DocElement.ts";
import { markdownToSheet } from "../ComponentDoc/markdown.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { LabeledTextInput } from "./LabeledInput.ts";
import { ModelFormula } from "./ModelFormula.ts";
import { act } from "./deps.ts";
import { m } from "./deps.ts";
import { userDefinition } from "../SesameModels/mod.ts";
import { invitationDefinition } from "../Journal/mod.ts";
import * as mod from "./mod.ts";
import { actCommon } from "./deps.ts";
import { three } from "../AtlasRenderer/deps.ts";

const { h, useState } = act;

const LabeledInputDemo = () => {
  const [text, setText] = useState('My initial text');
  return h(FramePresenter, { height: `200px` }, [
    h(LabeledTextInput, { value: text, onInput: setText, label: 'Text' })
  ]);
}

const ModelFormulaDemo = () => {
  const model = invitationDefinition;
  const cast = m.createModelCaster(model);
  const [value, setValue] = useState({
    gameId: 'userId',
    inviteeId: 'CoolUser',
    role: 'admin'
  })

  return [
    h(FramePresenter, {  }, [
      h('div', {}, [
        h(ModelFormula, { model, value, onInput: e => setValue(cast(e)) }),
      ]),
    ]),

    h('pre', {}, JSON.stringify(value, null, 2))
  ]
}

const LayoutDemo = () => {
  const id = actCommon.useId();

  return h(FramePresenter, {}, [
    h(mod.Column, {}, [
      h(mod.TextEditor, {
        label: {
          name: 'My Label',
          type: 'string',
          optional: true,
          description: 'This is a description for a label',
        },
        value: 'my cool string value',
      }),
      h(mod.Vector3Editor, { label: {
        name: 'My Vector',
      }, value: new three.Vector3() }),
      h(mod.NumberEditor, {
        label: {
          name: 'My Label',
          description: 'This is a description for a label',
        },
        value: 12345678,
      }),
    ])
  ]);
}

const demos = {
  LayoutDemo,
  'LabeledInputDemo': LabeledInputDemo,
  ModelFormulaDemo,
};

export const formulaDocs: DocSheet[] = [
  markdownToSheet('Formula', readme, demos)
]