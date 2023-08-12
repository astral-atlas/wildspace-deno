import { RenderSetup } from "./useRenderSetup.ts";
import {
  createContext, useContext
} from "./deps.ts";

export const renderSetupContext = createContext<null | RenderSetup>(null);

export const useParentRenderSetup = (): RenderSetup => {
  const render = useContext(renderSetupContext);
  if (!render)
    throw new Error(`Missing render setup in parents`);
  return render;
}