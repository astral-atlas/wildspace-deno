import { act, nanoid } from "./deps.ts";

export const useId = () => {
  return act.useMemo(() => nanoid(), []);
};
