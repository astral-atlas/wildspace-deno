import { artifact, m } from "./deps.ts";
import {
  whiteboardCanvasDefinition,
  whiteboardDefinition,
  whiteboardVectorDefinition,
  whiteboardStrokeDefinition,
  whiteboardCursorDefinition,
  noteDefinition,
  stickerDefinition,
  whiteboardStrokePointDefinition,
} from "./models.ts";

export const strokeProtocolMessageDefinitions = {
  "stroke-create": m.object({
    type: m.literal("stroke-create"),
    stroke: whiteboardStrokeDefinition,
  }),
  "stroke-update": m.object({
    type: m.literal("stroke-update"),
    stroke: whiteboardStrokeDefinition,
  }),
} as const;

export const assetMessageDefinitions = {
  "asset-list": m.object({
    type: m.literal("asset-list"),
    assets: m.array(m.object({
      assetId: artifact.assetIdDefinition,
      assetDownloadURL: m.string,
    }))
  }),
} as const;

export const noteMessageDefinitions = {
  "note-submit": m.object({
    type: m.literal("note-submit"),
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
  }),
  "note-create": m.object({
    type: m.literal("note-create"),
    note: noteDefinition,
  }),
  "note-move": m.object({
    type: m.literal("note-move"),
    noteId: noteDefinition.properties.id,
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
  }),
  "note-content-update": m.object({
    type: m.literal("note-content-update"),
    noteId: noteDefinition.properties.id,
    content: noteDefinition.properties.content,
  }),
  "note-delete": m.object({
    type: m.literal("note-delete"),
    noteId: noteDefinition.properties.id,
  }),
} as const;

export const stickerMessageDefinitions = {
  "sticker-submit": m.object({
    type: m.literal("sticker-submit"),
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
    rotation: m.number,
  }),
  "sticker-create": m.object({
    type: m.literal("sticker-create"),
    sticker: stickerDefinition,
  }),
  "sticker-move": m.object({
    type: m.literal("sticker-move"),
    stickerId: stickerDefinition.properties.id,
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
    rotation: m.number,
  }),
  "sticker-set-asset": m.object({
    type: m.literal("sticker-set-asset"),
    stickerId: stickerDefinition.properties.id,
    assetId: artifact.assetIdDefinition,
  }),
  "sticker-delete": m.object({
    type: m.literal("sticker-delete"),
    stickerId: stickerDefinition.properties.id,
  }),
} as const;

export const pointerProtocolMessageDefinitions = {
  "pointer-spawn": m.object({
    type: m.literal("pointer-spawn"),
    cursor: whiteboardCursorDefinition,
  }),
  "pointer-move": m.object({
    type: m.literal("pointer-move"),
    cursorId: m.string,
    position: whiteboardVectorDefinition,
  }),
  "pointer-despawn": m.object({
    type: m.literal("pointer-despawn"),
    cursorId: m.string,
  }),
} as const;

export const layerProtocolMessageDefinitions = {
  "layer-canvas-update": m.object({
    type: m.literal("layer-canvas-update"),
    layerId: m.string,
    canvas: m.array(whiteboardCanvasDefinition),
  }),
  "layer-sticker-update": m.object({
    type: m.literal("layer-sticker-update"),
    layerId: m.string,
    stickers: m.array(stickerDefinition),
  }),
} as const;

export const whiteboardProtocolMessageDefinition = m.union({
  ...strokeProtocolMessageDefinitions,
  ...layerProtocolMessageDefinitions,
  ...pointerProtocolMessageDefinitions,
  ...noteMessageDefinitions,
  ...stickerMessageDefinitions,
  ...assetMessageDefinitions,

  "whiteboard-update": m.object({
    type: m.literal("whiteboard-update"),
    whiteboard: whiteboardDefinition,
  }),
  "initialize": m.object({
    type: m.literal("initialize"),
    cursors: m.array(whiteboardCursorDefinition),
  })
});
export type WhiteboardProtocolMessage = m.OfModelType<
  typeof whiteboardProtocolMessageDefinition
>;


const client = m.union({
  ...noteMessageDefinitions,
  ...stickerMessageDefinitions,
  "pointer-move": m.object({
    type: m.literal("pointer-move"),
    position: whiteboardVectorDefinition,
  }),
  "stroke-start": m.object({
    type: m.literal("stroke-start"),
  }),
  "stroke-end": m.object({
    type: m.literal("stroke-end"),
  }),
  "move-object": m.object({
    type: m.literal('move-object'),
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
  })
});
type ClientMessage = m.OfModelType<typeof client>;

export type Protocol = {
  message: {
    client: ClientMessage,
    server: WhiteboardProtocolMessage,
  },
  message2: {
    client: ActionMessage,
    server: EventMessage
  }
}

export const protocol = {
  client,
  server: whiteboardProtocolMessageDefinition,
};

export const objectValue = m.union({
  sticker: m.object({
    type: m.literal('sticker'),
    sticker: stickerDefinition,
  }),
  note: m.object({
    type: m.literal('note'),
    note: noteDefinition,
  }),
  stroke: m.object({
    type: m.literal('stroke'),
    stroke: whiteboardStrokeDefinition,
  }),
})
export type ObjectValue = m.OfModelType<typeof objectValue>;

export const objectReference = m.union({
  null:     m.object({ type: m.literal('null') }),
  note:     m.object({ type: m.literal('note'), noteId: m.string, }),
  sticker:  m.object({ type: m.literal('sticker'), stickerId: m.string, }),
  stroke:   m.object({ type: m.literal('stroke'), strokeId: m.string, }),
});
export type ObjectReference = m.OfModelType<typeof objectReference>;
export const objectInput = m.union({
  'set-asset-id': m.object({
    type: m.literal('set-asset-id'),
    assetId: stickerDefinition.properties.assetId
  }),
  'set-content': m.object({
    type: m.literal('set-content'),
    content: noteDefinition.properties.content
  })
});
export type ObjectInput = m.OfModelType<typeof objectInput>;

export const objectAction = m.union({
  'move-object': m.object({
    type: m.literal('move-object'),
    position: whiteboardVectorDefinition,
    size: whiteboardVectorDefinition,
    rotation: m.number,
  }),
  'update-object': m.object({
    type: m.literal('update-object'),
    update: objectInput,
  }),
  'delete-object': m.object({
    type: m.literal('delete-object'),
  }),
  'add-stroke-points': m.object({
    type: m.literal('add-stroke-points'),
    points: m.array(whiteboardStrokePointDefinition)
  }),
})
export type ObjectAction = m.OfModelType<typeof objectAction>

export const actionMessage = m.union({
  ...objectAction.cases,
  'move-cursor': m.object({
    type: m.literal('move-cursor'),
    position: whiteboardVectorDefinition,
  }),
  'select': m.object({
    type: m.literal('select'),
    target: objectReference,
  }),
  'submit-object': m.object({
    type: m.literal('submit-object'),
    objectType: m.set(['note', 'sticker', 'stroke'] as const),
  }),
});
export type ActionMessage = m.OfModelType<typeof actionMessage>;

export const eventMessage = m.union({
  'move-cursor': m.object({
    type: m.literal('move-cursor'),
    position: whiteboardVectorDefinition,
    cursorId: whiteboardCursorDefinition.properties.id,
  }),
  'update-object': m.object({
    type: m.literal('update-object'),
    target: objectReference,
    update: objectAction,
  }),
  'add-object': m.object({
    type: m.literal('add-object'),
    object: objectValue,
  }),
  'remove-object': m.object({
    type: m.literal('remove-object'),
    object: objectReference,
  }),
  'set-asset-list': m.object({
    type: m.literal('set-asset-list'),
    assetList: artifact.assetListDefinition,
  }),
});
export type EventMessage = m.OfModelType<typeof eventMessage>;
