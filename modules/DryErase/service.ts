import { ModelOf, ModeledType } from "../Models/model.ts";
import { vectorDefinition } from "../TheaterModels/space.ts";
import { m, service, sesame, storage, nanoid, channel } from "./deps.ts";
import {
  Whiteboard,
  noteDefinition,
  whiteboardCursorDefinition,
  whiteboardDefinition,
  whiteboardLayerDefinition,
  whiteboardStickerDefinition,
  whiteboardStrokeDefinition,
  whiteboardVectorDefinition,
} from "./models.ts";

const whiteboardSystemDefinition = {
  names: ["dryerase", "whiteboard"],
  resource: whiteboardDefinition,
  partName: "ownerId",
  sortName: "whiteboardId",
  editable: m.object({
    ownerId: m.string,
    name: m.string,
    layers: whiteboardDefinition.properties.layers,
  }),
} as const;
type WhiteboardSystemType = service.ToCommonSystemType<
  typeof whiteboardSystemDefinition
>;

const stickerSystemDefinitition = {
  names: ["dryerase", "whiteboard", "sticker"],
  resource: whiteboardStickerDefinition,
  partName: "whiteboardId",
  sortName: "stickerId",
  editable: m.object({
    whiteboardId: m.string,
    layerId: m.string,
    assetId: m.string,
    size: whiteboardVectorDefinition,
    position: whiteboardVectorDefinition,
    rotation: m.number
  }),
} as const;
type StickerSystemType = service.ToCommonSystemType<
  typeof stickerSystemDefinitition
>;

const strokeSystemDefinitition = {
  names: ["dryerase", "whiteboard", "stroke"],
  resource: whiteboardStrokeDefinition,
  partName: "whiteboardId",
  sortName: "strokeId",
  editable: m.object({
    whiteboardId: whiteboardStrokeDefinition.properties.whiteboardId,
    layerId: whiteboardStrokeDefinition.properties.layerId,
    brush: whiteboardStrokeDefinition.properties.brush,
    points: whiteboardStrokeDefinition.properties.points,
  }),
} as const;
type StrokeSystemType = service.ToCommonSystemType<
  typeof strokeSystemDefinitition
>

const cursorSystemDefinitition = {
  names: ["dryerase", "whiteboard", "cursor"],
  resource: whiteboardCursorDefinition,
  partName: "whiteboardId",
  sortName: "cursorId",
  editable: m.object({
    whiteboardId: whiteboardDefinition.properties.id,
    ownerId: m.string,
    position: whiteboardVectorDefinition,
  })
} as const;
type CursorSystemType = service.ToCommonSystemType<
  typeof cursorSystemDefinitition
>;

const noteSystemDefinition = {
  names: ["dryerase", "whiteboard", "note"],
  resource: noteDefinition,
  partName: "whiteboardId",
  sortName: "noteId",
  editable: m.object({
    ownerId: m.nullable(noteDefinition.properties.ownerId),
    whiteboardId: m.nullable(noteDefinition.properties.whiteboardId),
    content: m.nullable(noteDefinition.properties.content),
    position: m.nullable(noteDefinition.properties.position),
    size: m.nullable(noteDefinition.properties.size),
  }),
} as const;
type NoteSystemType = service.ToCommonSystemType<
  typeof noteSystemDefinition
>;

export type WhiteboardTypes = {
  whiteboard: WhiteboardSystemType,
  stroke:     StrokeSystemType,
  sticker:    StickerSystemType,
  cursor:     CursorSystemType,
  note:       NoteSystemType
};

export const defs = {
  system: {
    whiteboard: whiteboardSystemDefinition,
    stroke:     strokeSystemDefinitition,
    sticker:    stickerSystemDefinitition,
    cursor:     cursorSystemDefinitition,
    note:       noteSystemDefinition
  }
} as const;

export type Meta = {
  ServiceDependencies: {
    [system in keyof WhiteboardTypes]:
      Pick<service.CommonSystemComponents<WhiteboardTypes[system]>, "changes" | "channel" | "storage">
  },
  MemoryServiceDependencies: {
    [system in keyof WhiteboardTypes]:
      Pick<service.CommonSystemComponents<WhiteboardTypes[system]>, "changes" | "channel" | "storage"> & {
        memoryStore: storage.DynamoMemoryStore<service.CommonSystemOutputType<WhiteboardTypes[system]>["storage"]>
      }
  },
  Services: {
    [system in keyof WhiteboardTypes]:
      service.CommonSystemComponents<WhiteboardTypes[system]>["service"]
  },
  ServiceInput: {
    [system in keyof WhiteboardTypes]:
      service.CommonSystemServiceImplementation<WhiteboardTypes[system]>
  }
}

export type DryEraseBackend = {
  deps: Meta["ServiceDependencies"],
  services: Meta["Services"]
};

export const createBackend = (
  deps: Meta["ServiceDependencies"],
  inputs: Meta["ServiceInput"]
): DryEraseBackend => {
  const createService = <T extends service.CommonSystemType>(
    def: service.CommonSystemDefinintion<T>,
    dep: Pick<service.CommonSystemComponents<T>, "changes" | "channel" | "storage">,
    input: service.CommonSystemServiceImplementation<T>,
  ): service.CommonSystemComponents<T>["service"] => {
    return  service.createCommonSystemService<T>({
      ...dep,
      definition: def,
      implementation: input
    });
  };
  return {
    deps,
    services: {
      whiteboard: createService(defs.system.whiteboard, deps.whiteboard, inputs.whiteboard),
      sticker:    createService(defs.system.sticker,    deps.sticker, inputs.sticker),
      stroke:     createService(defs.system.stroke,     deps.stroke, inputs.stroke),
      note:       createService(defs.system.note,       deps.note, inputs.note),
      cursor:     createService(defs.system.cursor,     deps.cursor, inputs.cursor),
    }
  }
};
export const createMemoryDeps = (
  inputs: Meta["ServiceInput"]
): Meta["MemoryServiceDependencies"] => {
  const createMemoryDep = <T extends service.CommonSystemType>(
    def: service.CommonSystemDefinintion<T>,
    impl: service.CommonSystemServiceImplementation<T>,
  ) => {
    const storage = service.createMemoryStore(def)
    return {
      ...service.createMemoryChannels(def, impl),
      storage,
      memoryStore: storage,
    }
  };
  return {
    whiteboard: createMemoryDep(defs.system.whiteboard, inputs.whiteboard),
    sticker: createMemoryDep(defs.system.sticker, inputs.sticker),
    stroke: createMemoryDep(defs.system.stroke, inputs.stroke),
    note: createMemoryDep(defs.system.note, inputs.note),
    cursor: createMemoryDep(defs.system.cursor, inputs.cursor),
  }
};

const expressionThrow = (error: unknown) => { throw error };

export const createInsecureImplementation = (
  userId: sesame.SesameUserID
): Meta["ServiceInput"] => {
  return {
    whiteboard: {
      create: (i) => ({ ...i, id: nanoid() }),
      update: (w, i) => ({ ...w, ...i }),
      calculateKey: (w) => ({ part: w.ownerId, sort: w.id }),
    },
    sticker: {
      create: (i) => ({ ...i, id: nanoid() }),
      update: (w, i) => ({ ...w, ...i }),
      calculateKey: (w) => ({ part: w.whiteboardId, sort: w.id }),
    },
    cursor: {
      create: (i) => ({ ...i, id: nanoid() }),
      update: (w, i) => ({ ...w, ...i }),
      calculateKey: (w) => ({ part: w.whiteboardId, sort: w.id }),
    },
    stroke: {
      create: (i) => ({ ...i, id: nanoid() }),
      update: (w, i) => ({ ...w, ...i }),
      calculateKey: (w) => ({ part: w.whiteboardId, sort: w.id }),
    },
    note: {
      create: (i) => ({
        whiteboardId: i.ownerId || expressionThrow(new Error('WhiteboardID is required')),
        ownerId: i.ownerId || expressionThrow(new Error('OwnerID is required')),
        content: i.content || { type: 'text', text: 'New Note' },
        size: i.size || { x: 0, y: 0 },
        position: i.position || { x: 0, y: 0},
        id: nanoid()
      }),
      update: (w, i) => ({
        ...w,
        position: i.position || w.position,
        size: i.size || w.size,
        content: i.content || w.content,
      }),
      calculateKey: (w) => ({ part: w.whiteboardId, sort: w.id }),
    },
  }
};

export type WhiteboardChannelClient = {
  whiteboardId: string;
};

export const createWhiteboardClientService = {};
