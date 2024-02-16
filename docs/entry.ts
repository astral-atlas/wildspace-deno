import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

import { DocSite2 } from "../modules/ComponentDoc/mod.ts";
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
import { doorJourneyDocs } from "../modules/DoorJourney/docs.ts";
import { dryEraseDocs } from "../modules/DryErase/docs.ts";
import { artifactDocs } from "../modules/Artifact/docs.ts";
import { journalDocs } from "../modules/Journal/docs.ts";
import { presentationDocs } from "../modules/Presentation/docs.ts";
import { sesameDocs } from "../modules/Sesame/docs.ts";
import { modelDocs } from "../modules/Models/docs.ts";
import { carpentryDocs } from "../modules/Carpentry/docs.ts";
import { universeDocContext } from "../modules/Universe/docs.ts";
import { clerkDocs } from "../modules/Clerk/docs.ts";
import { useRootNavigation } from "https://esm.sh/@lukekaalim/act-navigation@1.2.1";
import { pancakeDocs } from "../modules/Pancake/docs.ts";
import { universeDocs } from "../modules/Universe/docs.ts";

export const sheets = [
  [markdownToSheet('Changelog', changelog)],
  pancakeDocs,
  universeDocs,
  sesameDocs,
  modelDocs,
  frameSchedulerDocs,
  componentDocDocs,
  boxParticleDocs,
  deskplaneDocs,
  keyboardDocs,
  bigTableDocs,
  clerkDocs,
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
  journalDocs,
  presentationDocs,
  carpentryDocs,
].flat(1);

export const DocsApp: Component = () => {
  const navigation = useRootNavigation()
  return h(universeDocContext.Provider, {}, h(DocSite2, {
    sheets, navigation, basePath: '/',
    sidebarHero: h('div', {}, [
      h('h1', {}, 'Wildspace'),
      h('div', {}, 'A Game by Luke Kaalim'),
      h('hr'),
    ])
  }));
};

const entry = () => {
  renderCool(h(DocsApp), document.body)
};

entry();