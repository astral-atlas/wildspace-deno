import { m, simpleSystem } from "./deps.ts";
import { slideDef, slideContentDef } from "./slide.ts";

export const slideSystemDef = {
  key: 'presentation/slide',
  names: {
    partition: 'gameId',
    sort: 'slideId',
    resource: 'slide',
  },
  models: {
    resource: slideDef,
    create: m.object({
      gameId: m.string,
      name: m.string,
      content: slideContentDef,
    }),
    update: m.object({
      name: m.nullable(m.string),
      content: m.nullable(slideContentDef),
    })
  }
} as const;
export type SlideSystem = simpleSystem.TypeOfSimpleSystem<
  typeof slideSystemDef
>;
export const slideRESTDef = simpleSystem.createRESTTransactionDefinitions<SlideSystem>(
  slideSystemDef
);