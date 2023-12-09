import { act, actCommon, desk, journal, kayo } from "../../deps.ts";
import { JengaBlock, JengaRect, JengaSlideContent } from "../../jenga.ts";

const rootRect = {
  position: { x: 0, y: 0 },
  size: { x: 16, y: 9 },
};

export const screenToJengaSpace = (screenRect: desk.Rect, screenSize: desk.Vector2): JengaRect => {
  return {
    position: {
      x: (screenRect.position.x / screenSize.x) * rootRect.size.x,
      y: (screenRect.position.y / screenSize.y) * rootRect.size.y,
    },
    size: {
      x: (screenRect.size.x / screenSize.x) * rootRect.size.x,
      y: (screenRect.size.y / screenSize.y) * rootRect.size.y,
    }
  }
}
export const jengaToScreenSpace = (jengaRect: JengaRect, screenSize: desk.Vector2): desk.Rect => {
  return {
    position: {
      x: (jengaRect.position.x / rootRect.size.x) * screenSize.x,
      y: (jengaRect.position.y / rootRect.size.y) * screenSize.y,
    },
    size: {
      x: (jengaRect.size.x / rootRect.size.x) * screenSize.x,
      y: (jengaRect.size.y / rootRect.size.y) * screenSize.y,
    }
  }
}