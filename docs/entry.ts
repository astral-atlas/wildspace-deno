import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { render } from "../modules/AtlasRenderer/mod.ts";

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
import { renderCool } from "../modules/AtlasRenderer/renderer.ts";
import { dataDocs } from "../modules/Data/docs.ts";
import { sesameDocs } from "../www/sesame/docs.ts";
import { doorJourneyDocs } from "../modules/DoorJourney/docs.ts";
import { serviceCommonDocs } from "../modules/Data/ServiceCommon/docs.ts";
import { dryEraseDocs } from "../modules/DryErase/docs.ts";
import { artifactDocs } from "../modules/Artifact/docs.ts";

export const sheets = [
  [markdownToSheet('Changelog', changelog)],
  sesameDocs,
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
  dataDocs,
  dryEraseDocs,
  doorJourneyDocs,
  artifactDocs,
].flat(1);

export const DocsApp: Component = () => {
  return h(DocSite, {
    sheets, initialSheet: sheets[0].id,
  })
};

const entry = () => {
  renderCool(h(DocsApp), document.body)
};

entry();