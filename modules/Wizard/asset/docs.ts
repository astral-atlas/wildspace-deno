import { doc, DirectiveComponent, FramePresenter, createDocContext } from "../../ComponentDoc/mod.ts";
import { act, actCommon as ac, threeCommon, three } from '../deps.ts';

import * as mod from './mod.ts';

const { h } = act;

const model_sidebar_demo: DirectiveComponent = () => {
  const { gltf } = context.useDocContext();
  const selection = ac.useSelection<three.Object3D>();

  return h(FramePresenter, {},
    h(mod.ModelWizardSidebar, { scene: gltf.scene, selection }));
}
const model_demo: DirectiveComponent = () => {
  const { blob } = context.useDocContext();

  return h(FramePresenter, { negativeMargin: 256 },
    h(mod.ModelWizard, { content: blob }));
}

const context = createDocContext(async () => {
  const url = new URL('./doc_assets/VirtualCity.glb', import.meta.url);
  const blob = await fetch(url).then(r => r.blob());
  const loader = new threeCommon.gltf.GLTFLoader();
  const buffer = await blob.arrayBuffer();
  const gltf = await loader.parseAsync(buffer, '');

  return { gltf, blob }
});

doc({
  id: 'Asset Editors',
  parentId: 'Wizard',
  directiveComponents: {
    model_sidebar_demo,
    model_demo,
  },
  parent: context.Provider,
  readmeURL: new URL('./readme.md', import.meta.url)
})
