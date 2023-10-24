import { channel, janitor, rxjs } from "../deps.ts";
import { StickerContent, WhiteboardCursor, WhiteboardStroke } from "../models.ts";
import {
  ClientProtocol,
  ObjectTarget,
  ObjectType,
  ObjectUpdate,
  ServerProtocol,
} from "../protocol/mod.ts";
import { DryEraseBackend } from "../service.ts";

export type DryEraseChannel = channel.BidirectionalChannel<
  ServerProtocol,
  ClientProtocol
>;
/*

An AssetList is maintained by a whiteboard, representing all
the assets needed to render a whiteboard.

An asset list might need to be updated if a object
creates or references a new asset.

An "AssetListUpdate" is dispatched


*/

export const createDryEraseChannel = (
  userId: string,
  whiteboardId: string,
  backend: DryEraseBackend,
): DryEraseChannel => {
  const recieve = new rxjs.Subject<ServerProtocol>();
  const cleanup = janitor.createCleanupTask();

  const updates = backend.deps.updates.connect({ whiteboardId });
  updates.recieve.subscribe((update) => recieve.next(update));
  cleanup.register(() => updates.close());
  updates.recieve.pipe();

  let selection: ObjectTarget = { type: "null" };
  let cursor: WhiteboardCursor | null = null;
  let activeStroke: WhiteboardStroke | null = null;

  const createObject = async (objectType: ObjectType) => {
    if (!cursor) {
      return;
    }
    activeStroke = null;
    switch (objectType) {
      case "note": {
        const note = await backend.services.note.create({
          ownerId: userId,
          whiteboardId,
          position: cursor.position,
          size: { x: 0, y: 0 },
        });
        selection = { type: "note", noteId: note.id };
        updates.send({
          type: "create-object",
          object: { type: "note", note },
        });
        updates.send({
          type: 'select-object',
          target: { type: 'note', noteId: note.id }
        });
        return
      }
      case "stroke": {
        const stroke = await backend.services.stroke.create({
          whiteboardId,
          layerId: userId,
          brush: { color: "red", mode: "add" },
          points: [cursor.position],
        });
        selection = { type: "stroke", strokeId: stroke.id };
        activeStroke = stroke;
        updates.send({
          type: 'select-object',
          target: selection
        });
        return updates.send({
          type: "create-object",
          object: { type: "stroke", stroke },
        });
      }
      case "sticker": {
        const sticker = await backend.services.sticker.create({
          type: 'create',
          whiteboardId,
          layerId: userId,
          position: cursor.position,
        });
        selection = { type: "sticker", stickerId: sticker.id };
        updates.send({
          type: 'select-object',
          target: selection
        });
        return updates.send({
          type: "create-object",
          object: { type: "sticker", sticker },
        });
      }
    }
  };

  const updateAssetList = async () => {
    const stickers = await backend.services.sticker.list({ whiteboardId })
    const assetIds = stickers
      .map(s => s.content.type === 'asset' && s.content.assetId)
      .filter((assetId): assetId is string => !!assetId)
    const assetList = await Promise.all(assetIds.map(async assetId => ({
      assetId,
      downloadURL: (await backend.deps.artifact.url.createDownloadURL(assetId, userId)).href
    })));
    updates.send({
      type: 'update-assets',
      assetList,
    })
  }

  const updateStickerContent = async (content: StickerContent, stickerId: string) => {
    updates.send({
      type: "update-object",
      subject: selection,
      update: { type: 'content', content },
    });

    await backend.services.sticker.update({ whiteboardId, stickerId }, {
      type: 'content',
      content,
    });
    if (content.type === 'asset')
      await updateAssetList()
  }

  const updateObject = async (update: ObjectUpdate) => {
    switch (update.type) {
      case "delete": {
        updates.send({
          type: "update-object",
          subject: selection,
          update,
        });
        switch (selection.type) {
          case "note":
            return backend.services.note.delete({ whiteboardId, noteId: selection.noteId });
          case 'sticker':
            return backend.services.sticker.delete({ whiteboardId, stickerId: selection.stickerId });
          case 'stroke':
            return backend.services.stroke.delete({ whiteboardId, strokeId: selection.strokeId });
          default:
            return;
        }
      }
      case 'transform': {
        updates.send({
          type: "update-object",
          subject: selection,
          update,
        });
        if (selection.type === 'note') {
          return backend.services.note.update({ whiteboardId, noteId: selection.noteId }, {
            ownerId: null,
            whiteboardId,
            position: update.position,
            size: update.size,
          });
        }
        if (selection.type === 'sticker') {
          return backend.services.sticker.update({ whiteboardId, stickerId: selection.stickerId }, {
            type: 'transform',
            position: update.position,
            size: update.size,
            rotation: null,
          });
        }
        return;
      }
      case 'draw': {
        if (selection.type === 'stroke' && activeStroke) {
          if (cursor && activeStroke.points.length > 32) {
            const lastPoint = activeStroke.points[activeStroke.points.length - 1];
            activeStroke = await backend.services.stroke.create(
              {
                whiteboardId,
                points: [lastPoint, ...update.points],
                layerId: activeStroke.layerId,
                brush: activeStroke.brush
              },
            )
            selection.strokeId = activeStroke.id;
            updates.send({
              type: "create-object",
              object: { type: 'stroke', stroke: activeStroke },
            });
            return;
          } else {
            activeStroke = {
              ...activeStroke,
              points: [...activeStroke.points, ...update.points]
            };
            updates.send({
              type: "update-object",
              subject: selection,
              update,
            });
            return backend.services.stroke.update(
              { whiteboardId, strokeId: selection.strokeId },
              activeStroke
            );
          }
        } else return;
      }
      case 'content': {
        if (selection.type === 'sticker') {
          return updateStickerContent(update.content, selection.stickerId)
        }
        return;
      }
    }
  };

  const send = async (message: ClientProtocol) => {
    if (!cursor) {
      return;
    }
    switch (message.type) {
      case "move-cursor": {
        if (!cursor) {
          return;
        }
        const { position } = message;
        cursor = await backend.services.cursor.update({
          whiteboardId,
          cursorId: cursor.id,
        }, {
          whiteboardId,
          ownerId: userId,
          position,
        });
        return updates.send({ type: "set-cursor", cursor });
      }
      case "select-object":
        selection = message.target;
        updates.send({
          type: 'select-object',
          target: selection
        });
        if (selection.type === 'stroke')
          activeStroke = await backend.services.stroke.read({
            whiteboardId,
            strokeId: selection.strokeId
          })
        else
          activeStroke = null;
        return;
      case "create-object":
        return createObject(message.objectType);
      case "update-object":
        return updateObject(message.update);
    }
  };

  const close = () => {
    cleanup.run();
  };

  const init = async () => {
    cursor = await backend.services.cursor.create({
      whiteboardId,
      ownerId: userId,
      position: { x: 0, y: 0 },
    });
    cleanup.register(() =>
      void (cursor &&
        backend.services.cursor.delete({ whiteboardId, cursorId: cursor.id }))
    );
  };
  init();

  return {
    send,
    recieve,
    close,
  };
};
