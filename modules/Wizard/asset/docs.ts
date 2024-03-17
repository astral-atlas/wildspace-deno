import { doc, DirectiveComponent, FramePresenter, createDocContext } from "../../ComponentDoc/mod.ts";
import { act, actCommon as ac, threeCommon, three, kayo } from '../deps.ts';

import * as mod from './mod.ts';

const { h } = act;

const model_sidebar_demo: DirectiveComponent = () => {
  const { model } = context.useDocContext();
  const selection = ac.useSelection<three.Object3D>();

  return h(FramePresenter, {},
    h(kayo.HorizontalFrame, {},
      h(mod.ModelWizardSidebar, { scene: model.gltf.scene, selection }))
  );
}
const model_demo: DirectiveComponent = () => {
  const { model } = context.useDocContext();

  return h(FramePresenter, { negativeMargin: 256 },
    h(mod.ModelWizard, { content: model.blob }));
}
const image_demo: DirectiveComponent = () => {
  const { image } = context.useDocContext();

  return h(FramePresenter, { negativeMargin: 256 },
    h(mod.ImageWizard, { content: image.blob }));
}

const context = createDocContext(async () => {

  const loadModel = async () => {
    const url = new URL('./doc_assets/VirtualCity.glb', import.meta.url);
    const blob = await fetch(url).then(r => r.blob());
    const loader = new threeCommon.gltf.GLTFLoader();
    const buffer = await blob.arrayBuffer();
    const gltf = await loader.parseAsync(buffer, '');
    return { url, blob, buffer, gltf };
  };
  const loadImage = async () => {
    const url = new URL('./doc_assets/Wizards.jpg', import.meta.url);
    const blob = await fetch(url).then(r => r.blob());
    return { url, blob }
  }
  const loadAudio = async () => {
    const url = new URL('./doc_assets/Comona.ogg', import.meta.url);
    const blob = await fetch(url).then(r => r.blob());
    return { url, blob }
  }

  return {
    model: await loadModel(),
    image: await loadImage(),
    audio: await loadAudio()
  }
});

doc({
  id: 'Asset Editors',
  parentId: 'Wizard',
  directiveComponents: {
    model_sidebar_demo,
    model_demo,
    image_demo,
  },
  parent: context.Provider,
  readmeURL: new URL('./readme.md', import.meta.url)
})
