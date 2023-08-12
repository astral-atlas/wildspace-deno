import { act } from "./deps.ts";
import { RenderSetup } from "./useRenderSetup.ts";

export const renderSetupContext = act.createContext<null | RenderSetup>(null);

export const useParentRenderSetup = (): RenderSetup => {
  const render = act.useContext(renderSetupContext);
  if (!render)
    throw new Error(`Missing render setup in parents`);
  return render;
}