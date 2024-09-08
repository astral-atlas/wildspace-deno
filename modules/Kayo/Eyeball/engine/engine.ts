import { EyeballCore, useCore } from "./core"
import { useDropdownEngine } from "./dropdowns";

export type EyeballEngine = ReturnType<typeof useEngine>;

export const useEngine = () => {
  const core = useCore();
  const dropdowns = useDropdownEngine(core);

  return {
    core,
    dropdowns,
  };
}