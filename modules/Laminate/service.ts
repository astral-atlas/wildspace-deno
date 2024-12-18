import { ScreenSpaceService } from "./screenspace"
import { TooltipService } from "./tooltips"

export type LaminateService = {
  screen: ScreenSpaceService,
  tooltips: TooltipService,
}