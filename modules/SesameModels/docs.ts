import { markdownToSheet } from "../ComponentDoc/markdown.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { act } from '../Formula/deps.ts';
import { ModelVisualizer } from "../ModelDoc/ModelVisualizer.ts";
import { userDefinition } from "./user.ts";
import { appDefinition } from "./app.ts";
import { Model } from "../Models/model.ts";
import { secretDefinition } from "./secret.ts";
import { roleDefinition } from "./role.ts";
import { identityAuthorizationDefinition, identityRequestDefinition } from "./mod.ts";
import { identityGrantDefinition } from "./authority.ts";

const models = {
  'user': userDefinition,
  'app': appDefinition,
  'secret': secretDefinition,
  'role': roleDefinition,
  'identityRequest': identityRequestDefinition,
  'identityAuthorization': identityAuthorizationDefinition,
  'identityGrant': identityGrantDefinition
} as { [key: string]: null | Model };

export const sesameModelsDocs = [
  markdownToSheet('SesameModels', readme, {
    type: ({ node }) => {
      const name = node.attributes?.name || '';
      const model = models[name];
      if (!model)
        return act.h('div', {}, "Error: Can't find type");
      return act.h(ModelVisualizer, { model })
    }
  }, null, 'Sesame')
]