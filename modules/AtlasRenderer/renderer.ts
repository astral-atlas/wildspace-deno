import {
  createReconciler,
  createEffectService,
  createBoundaryService,
  createSchedule2,
} from "https://esm.sh/@lukekaalim/act-reconciler@3.7.5";
import {
  createWebRenderer,
  setNodeChildren2,
} from "https://esm.sh/@lukekaalim/act-web@2.5.5";
import { Element } from "https://esm.sh/@lukekaalim/act@2.6.0";
import {
  Renderer2,
  createNullRenderer2,
} from "https://esm.sh/@lukekaalim/act-renderer-core@3.5.5";
import { three, actThree } from "./deps.ts";

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
  const webToThree = createNullRenderer2<three.Object3D, Node>(
    () => object,
    ["three"]
  ) as Renderer2<Node>;
  const threeToWeb = createNullRenderer2<Node, three.Object3D>(
    () => web,
    ["web"]
  ) as Renderer2<three.Object3D>;

  const object = actThree.createObjectRenderer(
    (type): null | Renderer2<three.Object3D> => {
      switch (type) {
        case "web":
          return threeToWeb as Renderer2<three.Object3D>;
        default:
          return null;
      }
    }
  ) as Renderer2<three.Object3D>;
  const web = createWebRenderer((type) => {
    switch (type) {
      case actThree.scene:
      case "three":
        return webToThree;
      default:
        return null;
    }
  })  as Renderer2<Node>;

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
