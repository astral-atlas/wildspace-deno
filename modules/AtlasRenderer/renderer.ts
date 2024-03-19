import {
  createReconciler,
  createEffectService,
  createBoundaryService,
  createSchedule2,

  createWebRenderer,
  setNodeChildren2,
  
  Renderer2,
  createNullRenderer2,
} from "./deps.ts";

import { act, three, actThree } from "./deps.ts";

export const render = (element: act.Element, node: HTMLElement) => {
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

export const renderCool = (element: act.Element, node: HTMLElement) => {
  const webToThree = createNullRenderer2<three.Object3D, Node>(
    () => object,
    ["three", 'null']
  ) as Renderer2<Node>;
  const threeToWeb = createNullRenderer2<Node, three.Object3D>(
    () => web,
    ["web", 'null']
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
      case 'null':
        return threeToWeb as Renderer2<null>;
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
