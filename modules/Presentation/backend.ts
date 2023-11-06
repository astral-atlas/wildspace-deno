import { nanoid, simpleSystem } from "./deps.ts";
import { SlideSystem, slideSystemDef } from "./system.ts";

export type PresentationBackend = {
  slide: simpleSystem.Components<SlideSystem>,
}

export const createBackend = (world: simpleSystem.World) => {
  const slide = simpleSystem.createComponents<SlideSystem>(world, {
    definition: slideSystemDef,
    service: {
      calculateKey(slide) {
        return { part: slide.gameId, sort: slide.id }
      },
      create({ name, content, gameId }) {
        return {
          id: nanoid(),
          gameId,
          name,
          content,
        };
      },
      update(prev, { name, content }) {
        return {
          ...prev,
          name: name || prev.name,
          content: content || prev.content,
        }
      }
    },
  })

  return { slide };
};