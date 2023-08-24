import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { render } from "https://esm.sh/@lukekaalim/act-three@5.12.4?sourcemap";

import { DocSite } from "../modules/ComponentDoc/DocSite.ts";
import { frameSchedulerDocs } from "../modules/FrameScheduler/docs.ts";
import { componentDocDocs } from "../modules/ComponentDoc/docs.ts";
import { boxParticleDocs } from "../modules/BoxParticle/docs.ts";
import { deskplaneDocs } from "../modules/Deskplane/docs.ts";
import { keyboardDocs } from "../modules/Keyboard/docs.ts";
import { bigTableDocs } from "../modules/BigTable/docs.ts";
import { threeCommonDocDocs } from "../modules/ThreeCommonDoc/docs.ts";
import { effectsCommonDocs } from "../modules/EffectsCommon/docs.ts";
import { sesameDataServiceDocs } from "../modules/Data/SesameDataService/docs.ts";
import { authenticationDocs } from "../modules/Authentication/docs.ts";
import { formulaDocs } from "../modules/Formula/docs.ts";
import { sesameModelsDocs } from "../modules/SesameModels/docs.ts";

// @deno-types="vite-text"
import changelog from '../CHANGELOG.md?raw';
import { markdownToSheet } from "../modules/ComponentDoc/mod.ts";
import { kayoDocs } from "../modules/Kayo/docs.ts";

export const sheets = [
  [markdownToSheet('Changelog', changelog)],
  frameSchedulerDocs,
  componentDocDocs,
  boxParticleDocs,
  deskplaneDocs,
  keyboardDocs,
  bigTableDocs,
  threeCommonDocDocs,
  effectsCommonDocs,
  sesameDataServiceDocs,
  authenticationDocs,
  formulaDocs,
  sesameModelsDocs,
  kayoDocs,
].flat(1);

export const DocsApp: Component = () => {
  return h(DocSite, {
    sheets, initialSheet: sheets[0].id,
  })
};

const entry = () => {
  render(h(DocsApp), document.body)
};

entry();