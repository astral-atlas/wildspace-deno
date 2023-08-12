import {
  createReconciler,
  createEffectService,
  createBoundaryService,
  createSchedule2,
} from "https://esm.sh/@lukekaalim/act-reconciler@3.7.3";
import {
  createWebRenderer,
  setNodeChildren2,
} from "https://esm.sh/@lukekaalim/act-web@2.5.3";
import { Element } from "https://esm.sh/@lukekaalim/act@2.6.0";
import {
  Renderer2,
  createNullRenderer2,
} from "https://esm.sh/@lukekaalim/act-renderer-core@3.5.3";
import { createObjectRenderer } from "https://esm.sh/@lukekaalim/act-three@5.10.5";

// @deno-types="https://esm.sh/v130/@types/three@0.155.0/index.d.ts"
import { Object3D } from "https://esm.sh/three@0.155.0";

export const render = (element: Element, node: HTMLElement) => {
  const web = createWebRenderer();

  const onScheduleRequest = (callback: (deadline: number) => void) => {
    const id = requestAnimationFrame(() => callback(16));
    return () => cancelAnimationFrame(id);
  };
  const scheduler = createSchedule2(onScheduleRequest);
  const effect = createEffectService(scheduler);
  const boundary = createBoundaryService();
  const reconciler = createReconciler(scheduler);

  reconciler.diff.subscribeDiff((set) => {
    setNodeChildren2(node, web.render(set, set.root));
    reconciler.tree.live.registry = effect.runEffectRegistry(set.registry);

    const map = boundary.calcBoundaryMap(set);
    boundary.getRootBoundaryValue(set.suspensions, set, map);
  });
  reconciler.tree.mount(element);
};

export const renderCool = (element: Element, node: HTMLElement) => {
  const webToThree = createNullRenderer2<Object3D, Node>(
    () => object,
    ["three"]
  );
  const threeToWeb = createNullRenderer2<Node, Object3D>(() => web, ["web"]);

  const object = createObjectRenderer((type): null | Renderer2<Object3D> => {
    switch (type) {
      case "web":
        return threeToWeb as Renderer2<Object3D>;
      default:
        return null;
    }
  });
  const web = createWebRenderer((type) => {
    switch (type) {
      case "scene":
      case "three":
        return webToThree;
      default:
        return null;
    }
  });

  const scheduler = createSchedule2((callback) => {
    const id = requestAnimationFrame(() => callback(16));
    return () => cancelAnimationFrame(id);
  });
  const effect = createEffectService(scheduler);
  const boundary = createBoundaryService();

  const reconciler = createReconciler(scheduler);

  reconciler.diff.subscribeDiff((set) => {
    const children = web.render(set, set.root);
    setNodeChildren2(node, children);

    reconciler.tree.live.registry = effect.runEffectRegistry(set.registry);

    const map = boundary.calcBoundaryMap(set);
    boundary.getRootBoundaryValue(set.suspensions, set, map);
  });
  reconciler.tree.mount(element);
};
