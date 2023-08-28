import { act } from "./deps.ts";

export const useOverridableRef = <T>(
  override: void | act.Ref<null | T> | null
): act.Ref<null | T> => {
  const localRef = act.useRef<null | T>(null);
  return override || localRef;
};
