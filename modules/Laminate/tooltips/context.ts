import { act } from "atlas-renderer";
import { TooltipService } from "./service";

export type TooltipContext = {
  service: null | TooltipService,
}

export const tooltipContext = act.createContext<TooltipContext>({ service: null })