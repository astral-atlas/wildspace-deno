import { ModelOf, ModeledType } from "../Models/model.ts";
import { vectorDefinition } from "../TheaterModels/space.ts";
import { m, service, sesame, storage, nanoid, channel, } from "./deps.ts";
import * as d from './deps.ts'
import {
  Whiteboard,
  noteDefinition,
  stickerContentDefinition,
  stickerDefinition,
  whiteboardCursorDefinition,
  whiteboardDefinition,
  whiteboardStrokeDefinition,
  whiteboardVectorDefinition,
} from "./models.ts";
import { Protocol, WhiteboardProtocolMessage } from "./protocol.ts";
import { ServerProtocol } from "./protocol/mod.ts";

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
  resource: stickerDefinition,
  partName: "whiteboardId",
  sortName: "stickerId",
  editable: m.union2([
    m.object({
      type: m.literal('create'),
      whiteboardId: m.string,
      layerId: m.nullable(m.string),
      position: whiteboardVectorDefinition,
    }),
    m.object({
      type: m.literal('content'),
      content:  stickerContentDefinition,
    }),
    m.object({
      type: m.literal('transform'),
      size: m.nullable(whiteboardVectorDefinition),
      position: m.nullable(whiteboardVectorDefinition),
      rotation: m.nullable(m.number)
    }),
  ]),
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
    whiteboard: whiteboardSystemDefinition as service.CommonSystemDefinintion<WhiteboardSystemType>,
    stroke:     strokeSystemDefinitition  as service.CommonSystemDefinintion<StrokeSystemType>,
    sticker:    stickerSystemDefinitition  as service.CommonSystemDefinintion<StickerSystemType>,
    cursor:     cursorSystemDefinitition  as service.CommonSystemDefinintion<CursorSystemType>,
    note:       noteSystemDefinition as service.CommonSystemDefinintion<NoteSystemType>,
  }
} as const;

/*
Service creation is done in three phases:
  - (Big Bang).
    - Connection to "hard" dependencies, like databases
    and signalers
  - Atomic Services
    - Construction of Channels, Storage Devices.
      These services follow well-established types and basic
      interfaces, and mostly act as boilerplate to abstract away
      common operations.
  - Molecular Services

*/


export type Meta = {
  UpdateBandType: {
    dial: { whiteboardId: Whiteboard["id"] },
    message: ServerProtocol
  },
  SpecialDependencies: {
    updates: channel.Band<Meta["UpdateBandType"]>,
    artifact: d.artifact.Service,
  },
  ServiceDependencies: {
    [system in keyof WhiteboardTypes]:
      Pick<service.CommonSystemComponents<WhiteboardTypes[system]>, "changes" | "channel" | "storage">
  } & Meta["SpecialDependencies"],
  MemoryServiceDependencies: {
    [system in keyof WhiteboardTypes]:
      Pick<service.CommonSystemComponents<WhiteboardTypes[system]>, "changes" | "channel" | "storage"> & {
        storage: storage.DynamoMemoryStore<service.CommonSystemOutputType<WhiteboardTypes[system]>["storage"]>,
      }
  } & Meta["SpecialDependencies"],
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
      whiteboard: createService(defs.system.whiteboard, deps.whiteboard,  inputs.whiteboard),
      sticker:    createService(defs.system.sticker,    deps.sticker,     inputs.sticker),
      stroke:     createService(defs.system.stroke,     deps.stroke,      inputs.stroke),
      note:       createService(defs.system.note,       deps.note,        inputs.note),
      cursor:     createService(defs.system.cursor,     deps.cursor,      inputs.cursor),
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
    return {
      ...service.createMemoryChannels<T>(def, impl),
      storage: service.createMemoryStore(def),
    }
  };
  
  return {
    artifact: d.artifact.createMemoryService().service,
    updates: channel.createMemoryBand<Meta["UpdateBandType"]>(({ whiteboardId }) => whiteboardId),
    whiteboard: createMemoryDep(defs.system.whiteboard, inputs.whiteboard),
    sticker: createMemoryDep(defs.system.sticker, inputs.sticker),
    stroke: createMemoryDep(defs.system.stroke, inputs.stroke),
    note: createMemoryDep(defs.system.note, inputs.note),
    cursor: createMemoryDep(defs.system.cursor, inputs.cursor),
  }
};

const expressionThrow = (error: unknown) => { throw error };

export const createInsecureImplementation = (
  userId: sesame.SesameUserID,
  artifact: d.artifact.Service,
): Meta["ServiceInput"] => {
  return {
    whiteboard: {
      create: (i) => ({ ...i, id: nanoid() }),
      update: (w, i) => ({ ...w, ...i }),
      calculateKey: (w) => ({ part: w.ownerId, sort: w.id }),
    },
    sticker: {
      create: (i) => {
        if (i.type !== 'create')
          throw new Error();
        console.log({ position: i.position || { x: 0, y: 0 }, })
        return {
          id: nanoid(),
          whiteboardId: i.whiteboardId,
          layerId: i.layerId || expressionThrow(new Error('layerId is required')),
          content: { type: 'null' },
          size: { x: 0, y: 0 },
          position: i.position || { x: 0, y: 0 },
          rotation: 0,
        }
      },
      update: async (sticker, i) => {
        switch (i.type) {
          case 'create':
            throw new Error();
          case 'content': {
            switch (i.content.type) {
              case 'asset': {
                // Validate Asset is uploaded
                const asset = await artifact.assets.read({
                  ownerId: userId,
                  assetId: i.content.assetId
                });
                if (asset.state !== 'uploaded')
                  throw new Error('Asset is not Uploaded!');
                }
            }
            return { ...sticker, content: i.content };
          }
          case 'transform': {
            return {
              ...sticker,
              position: i.position || sticker.position,
              rotation: i.rotation || sticker.rotation,
              size: i.size || sticker.size,
            }
          }
        }
      },
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
        whiteboardId: i.whiteboardId || expressionThrow(new Error('WhiteboardID is required')),
        ownerId: i.ownerId || expressionThrow(new Error('OwnerID is required')),
        size: i.size || { x: 0, y: 0 },
        position: i.position || { x: 0, y: 0},
        id: nanoid()
      }),
      update: (w, i) => ({
        ...w,
        position: i.position || w.position,
        size: i.size || w.size,
      }),
      calculateKey: (w) => ({ part: w.whiteboardId, sort: w.id }),
    },
  }
};

export type WhiteboardChannelClient = {
  whiteboardId: string;
};

export const createWhiteboardClientService = {};
