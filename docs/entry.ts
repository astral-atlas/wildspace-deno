import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { render } from "https://esm.sh/@lukekaalim/act-web@2.3.0";
import { DocSite } from "../modules/ComponentDoc/DocSite.ts";
import { frameSchedulerDocs } from "../modules/FrameScheduler/docs.ts";
import { componentDocDocs } from "../modules/ComponentDoc/docs.ts";
import { boxParticleDocs } from "../modules/BoxParticle/docs.ts";
import { deskplaneDocs } from "../modules/Deskplane/docs.ts";
import { keyboardDocs } from "../modules/Keyboard/docs.ts";

const sheets = [
  frameSchedulerDocs,
  componentDocDocs,
  boxParticleDocs,
  deskplaneDocs,
  keyboardDocs,
].flat(1);

export const DocsApp: Component = () => {
  return h(DocSite, { sheets, initialSheet: sheets[0].id })
};

const entry = () => {
  render(h(DocsApp), document.body)
};

entry();