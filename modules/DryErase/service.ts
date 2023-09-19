import { ModelOf, ModeledType } from "../Models/model.ts";
import { m, service, sesame, storage, nanoid, channel } from "./deps.ts";
import {
  Whiteboard,
  whiteboardCursorDefinition,
  whiteboardDefinition,
  whiteboardLayerDefinition,
  whiteboardStickerDefinition,
  whiteboardStrokeDefinition,
  whiteboardVectorDefinition,
} from "./models.ts";

const whiteboardServiceDefinitition = service.createCRUDDefinition({
  path: "dryerase/whiteboard",
  name: "whiteboard",
  resource: whiteboardDefinition,
  create: m.object({ name: m.string, ownerId: m.string }),
  update: m.object({
    name: m.string,
    layers: m.array(whiteboardLayerDefinition),
  }),
  id: m.object({ whiteboardId: m.string }),
  filter: m.object({ ownerId: m.string }),
} as const);
type WhiteboardServiceDefinitition = service.TypeOfCRUDDefinition<
  typeof whiteboardServiceDefinitition
>;

const whiteboardStickerServiceDefinitition =
  service.createCommonSystemDefinition({
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
      rotation: m.number,
    }),
  } as const);
type StickerSystemType = service.ToCommonSystemType<
  typeof whiteboardStickerServiceDefinitition
>;
const whiteboardStrokeServiceDefinitition =
  service.createCommonSystemDefinition({
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
  } as const);
type StrokeSystemType = service.ToCommonSystemType<
  typeof whiteboardStrokeServiceDefinitition
>;
const whiteboardCursorServiceDefinitition =
  service.createCommonSystemDefinition({
    names: ["dryerase", "whiteboard", "cursor"],
    resource: whiteboardCursorDefinition,
    partName: "whiteboardId",
    sortName: "cursorId",
    editable: m.object({
      whiteboardId: whiteboardCursorDefinition.properties.whiteboardId,
      ownerId: whiteboardCursorDefinition.properties.ownerId,
      position: whiteboardVectorDefinition,
    }),
  } as const);
type CursorSystemType = service.ToCommonSystemType<
  typeof whiteboardCursorServiceDefinitition
>;

export type WhiteboardTypes = {
  strokeSystem: StrokeSystemType,
  stickerSystem: StickerSystemType,
  cursorSystem: CursorSystemType,
};

export const systems = {
  stroke: whiteboardStrokeServiceDefinitition,
  sticker: whiteboardStickerServiceDefinitition,
  cursor: whiteboardCursorServiceDefinitition,
}

export type WhiteboardBackendService = {
  whiteboard: service.CRUDService<WhiteboardServiceDefinitition>;
  stickers: service.CommonSystemComponents<StickerSystemType>["service"];
  stroke: service.CommonSystemComponents<StrokeSystemType>["service"];
  cursor: service.CommonSystemComponents<CursorSystemType>["service"];
  deps: WhiteboardBackendServiceDependencies,
};
export type WhiteboardBackendServiceDependencies = {
  whiteboards: storage.DynamoPartitionClient<{
    value: Whiteboard;
    sort: "";
    part: Whiteboard["id"];
  }>;
  whiteboardsByOwner: storage.DynamoPartitionClient<{
    value: { id: Whiteboard["id"] };
    sort: Whiteboard["id"];
    part: sesame.SesameUserID;
  }>;

  stickers: {
    channel: service.CommonSystemComponents<StickerSystemType>["channel"];
    storage: service.CommonSystemComponents<StickerSystemType>["storage"];
  };
  stroke: {
    channel: service.CommonSystemComponents<StrokeSystemType>["channel"];
    storage: service.CommonSystemComponents<StrokeSystemType>["storage"];
  };
  cursor: {
    channel: service.CommonSystemComponents<CursorSystemType>["channel"];
    storage: service.CommonSystemComponents<CursorSystemType>["storage"];
  };
};

export const createWhiteboardBackendService = (
  userId: sesame.SesameUserID,
  store: WhiteboardBackendServiceDependencies
): WhiteboardBackendService => {
  const whiteboard: WhiteboardBackendService["whiteboard"] = {
    async create({ ownerId, name }) {
      const whiteboard = {
        id: nanoid(),
        name,
        ownerId,
        layers: [],
      };
      await store.whiteboards.put(
        { part: whiteboard.id, sort: "" },
        whiteboard
      );
      await store.whiteboardsByOwner.put(
        { part: ownerId, sort: whiteboard.id },
        { id: whiteboard.id }
      );
      return whiteboard;
    },
    async update({ whiteboardId }, { layers, name }) {
      const prevBoard = await store.whiteboards.get({
        part: whiteboardId,
        sort: "",
      });
      const nextBoard = {
        ...prevBoard,
        layers,
        name,
      };
      await store.whiteboards.put({ part: whiteboardId, sort: "" }, nextBoard);
      return nextBoard;
    },
    async list({ ownerId }) {
      const results = await store.whiteboardsByOwner.query({
        part: ownerId,
        type: "all",
      });
      return await Promise.all(
        results.map((r) =>
          store.whiteboards.get({ part: r.value.id, sort: "" })
        )
      );
    },
    async read({ whiteboardId }) {
      return await store.whiteboards.get({ part: whiteboardId, sort: "" });
    },
    async delete({ whiteboardId }) {
      return await store.whiteboards.delete({ part: whiteboardId, sort: "" });
    },
  };

  const stickers = service.createCommonSystemService<StickerSystemType>({
    storage: store.stickers.storage,
    channel: store.stickers.channel,
    definition: whiteboardStickerServiceDefinitition,
    implementation: {
      calculateKey(item) {
        return { part: item.whiteboardId, sort: item.id };
      },
      create(input) {
        return {
          id: nanoid(),
          ...input,
        };
      },
      update(prev, input) {
        return {
          ...prev,
          ...input,
          whiteboardId: prev.whiteboardId,
        };
      },
    },
  });
  const stroke = service.createCommonSystemService<StrokeSystemType>({
    storage: store.stroke.storage,
    channel: store.stroke.channel,
    definition: whiteboardStrokeServiceDefinitition,
    implementation: {
      calculateKey(item) {
        return { part: item.whiteboardId, sort: item.id };
      },
      create(input) {
        return {
          id: nanoid(),
          ...input,
        };
      },
      update(prev, input) {
        return {
          ...prev,
          ...input,
          whiteboardId: prev.whiteboardId,
        };
      },
    },
  });
  const cursor = service.createCommonSystemService<CursorSystemType>({
    storage: store.cursor.storage,
    channel: store.cursor.channel,
    definition: whiteboardCursorServiceDefinitition,
    implementation: {
      calculateKey(item) {
        return { part: item.whiteboardId, sort: item.id };
      },
      create(input) {
        return {
          id: nanoid(4),
          ...input,
        };
      },
      update(prev, input) {
        return {
          ...prev,
          ...input,
          whiteboardId: prev.whiteboardId,
        };
      },
    },
  });

  return { whiteboard, stickers, stroke, cursor, deps: store };
};

export type WhiteboardChannelClient = {
  whiteboardId: string;
};

export const createWhiteboardClientService = {};
