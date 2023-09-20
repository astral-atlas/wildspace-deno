import { act, actThree, three } from "./deps.ts";

const { useEffect, useRef, h ,} = act;

export type ObjectAttacherProps = {
  object: null | three.Object3D;
} & Omit<actThree.GroupProps, "ref">;

export const ObjectAttacher: act.Component<ObjectAttacherProps> = ({ object, ...props }) => {
  const ref = useRef<three.Group | null>(null);
  useEffect(() => {
    const { current: group } = ref;
    if (!group || !object) return;
    const instance = object.clone();
    group.add(instance);
    return () => {
      console.log('removing child', instance)
      group.remove(instance);
    };
  }, [object]);

  return h(actThree.group, { ...props, ref, ignoreChildren: true });
};
