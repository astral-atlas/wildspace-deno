import { act, actThree, three } from "./deps.ts";

const { useEffect, useRef, h ,} = act;

export type HelperProps = {
  helper: null | three.Object3D;
} & Omit<actThree.GroupProps, "ref">;

export const Helper: act.Component<HelperProps> = ({ helper, ...props }) => {
  const ref = useRef<three.Group | null>(null);
  useEffect(() => {
    const { current: group } = ref;
    if (!group || !helper) return;
    group.add(helper);
    return () => {
      group.remove(helper);
    };
  }, [helper]);

  return h(actThree.group, { ...props, ref });
};
