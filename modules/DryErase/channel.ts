import { BidirectionalChannel } from "../Data/ChannelCommon/channel.ts";
import { _, rxjs } from "./deps.ts";
import { WhiteboardCursor, WhiteboardStroke, WhiteboardVector } from "./models.ts";
import { Protocol } from "./protocol.ts";
import { DryEraseBackend } from "./service.ts";

export type WhiteboardChannel = BidirectionalChannel<
  Protocol["message2"]["server"],
  Protocol["message2"]["client"]
>;

type UnionMap<Message extends { type: string }> = {
  [MessageType in Message["type"]]: Extract<Message, { type: MessageType }>;
};

type ChannelHandlerMap<Message extends { type: string }> = {
  [MessageType in keyof UnionMap<Message>]?: (
    message: UnionMap<Message>[MessageType]
  ) => void;
};

const runHandler = <
  MessageType extends string,
  Message extends { type: MessageType }
>(
  message: Message,
  handlerMap: ChannelHandlerMap<Message>
) => {
  const handler = handlerMap[message.type];
  if (!handler) return null;
  return (handler as (message: Message) => void)(message);
};

const cleanupCollection = () => {
  let cleaning = false;
  const cleanupFuncs: (() => void | Promise<unknown>)[] = [];
  const register = (cleanupFunc: () => void | Promise<unknown>) => {
    cleanupFuncs.push(cleanupFunc);
  };
  const run = () => {
    if (cleaning)
      return;
    cleaning = true;
    cleanupFuncs
      .map(async cleanupFunc => await cleanupFunc())
      .map(promise => promise.catch(console.error))
  };
  return { register, run }
}

export const createWhiteboardServerChannel = (
  userId: string,
  whiteboardId: string,
  backend: DryEraseBackend,
): WhiteboardChannel => {
  const cleanup = cleanupCollection();
  const recieve = new rxjs.ReplaySubject<Protocol["message"]["server"]>(Infinity, Infinity);

  const cursorChannel = backend.deps.cursor.changes({ whiteboardId });
  cleanup.register(() => cursorChannel.close());

  const strokeChannel = backend.deps.stroke.changes({ whiteboardId });
  cleanup.register(() => strokeChannel.close());

  const noteChannel = backend.deps.note.changes({ whiteboardId });
  cleanup.register(() => noteChannel.close());

  const cursorSubscription = cursorChannel.recieve.subscribe((event) => {
    switch (event.action) {
      case "CREATE":
        return recieve.next({
          type: "pointer-spawn",
          cursor: event.item,
        });
      case "UPDATE":
        return recieve.next({
          type: "pointer-move",
          position: event.item.position,
          cursorId: event.item.id,
        });
      case "DELETE":
        return recieve.next({
          type: "pointer-despawn",
          cursorId: event.item.id,
        });
    }
  });
  cleanup.register(() => cursorSubscription.unsubscribe());

  const strokeSubscription = strokeChannel.recieve.subscribe((event) => {
    switch (event.action) {
      case "CREATE":
        return recieve.next({
          type: "stroke-create",
          stroke: event.item,
        });
      case "UPDATE":
        return recieve.next({
          type: "stroke-update",
          stroke: event.item,
        });
    }
  });
  cleanup.register(() => strokeSubscription.unsubscribe());

  const noteSubscription = noteChannel.recieve.subscribe((event) => {
    switch (event.action) {
      case "CREATE":
        return recieve.next({
          type: "note-create",
          note: event.item,
        });
      case "UPDATE":
    }
  });
  cleanup.register(() => noteSubscription.unsubscribe());

  const updates = backend.deps.updates.connect({ whiteboardId })
  cleanup.register(() => updates.close());

  const updateSubscription = updates.recieve.subscribe((update) => {
    recieve.next(update);
  })
  cleanup.register(() => updateSubscription.unsubscribe());

  let cursor: WhiteboardCursor | null = null;
  let stroke: WhiteboardStroke | null = null;
  let position: WhiteboardVector | null = null;

  const init = async () => {
    const createdCursor = await backend.services.cursor.create({
      whiteboardId,
      ownerId: userId,
      position: { x: 0, y: 0 },
    });
    cursor = createdCursor;
    cleanup.register(() => backend.services.cursor.delete({ whiteboardId, cursorId: createdCursor.id }))
    recieve.next({
      type: 'initialize',
      cursors: await backend.services.cursor.list({ whiteboardId })
    })
  }
  init();

  const updateStroke = _.throttle(async (position: WhiteboardVector) => {
    if (stroke) {
      if (stroke.points.length > 12) {
        const lastPoint = stroke.points[stroke.points.length - 1];
        stroke = await backend.services.stroke.create({
          whiteboardId,
          layerId: '',
          brush: { color: 'blue', mode: 'add' },
          points: [lastPoint, { position, width: 1 }],
        })
      } else {
        stroke = await backend.services.stroke.update({
          whiteboardId,
          strokeId: stroke.id,
        }, { ...stroke, points: [...stroke.points, { position, width: 1 }] })
      }
    }
  }, 100);
  const send = (message: Protocol["message"]["client"]) => {
    const handlers: ChannelHandlerMap<Protocol["message"]["client"]> = {
      async "pointer-move"(event) {
        position = event.position;
        if (!cursor)
          return;
        await backend.services.cursor.update(
          { whiteboardId, cursorId: cursor.id },
          {
            whiteboardId,
            ownerId: userId,
            position: event.position,
          }
        );
        updateStroke(event.position);
      },
      async 'stroke-start'() {
        stroke = await backend.services.stroke.create({
          whiteboardId, layerId: '',
          brush: { color: 'blue', mode: 'add' },
          points: position && [{ position, width: 1 }] || [],
        })
      },
      async 'note-submit'({ position, size}) {
        const note = await backend.services.note.create({
          whiteboardId,
          content: null,
          ownerId: userId,
          position,
          size,
        })
        updates.send({
          type: 'note-create',
          note,
        });
      },
      async 'note-move'({ position, size, noteId }) {
        const key = {
          whiteboardId,
          noteId,
        };
        await backend.services.note.update(key, {
          whiteboardId: null,
          content: null,
          ownerId: null,
          position,
          size,
        })
        updates.send({
          type: 'note-move',
          position,
          size,
          noteId,
        });
      },
      async 'note-content-update'({ content, noteId }) {
        const key = {
          whiteboardId,
          noteId,
        };
        await backend.services.note.update(key, {
          whiteboardId: null,
          content,
          ownerId: null,
          position: null,
          size: null,
        })
        updates.send({
          type: 'note-content-update',
          content,
          noteId,
        });
      },
      'stroke-end'() {
        stroke = null;
      },
      async 'sticker-submit'(event) {
        const { position, size, rotation } = event;
        await backend.services.sticker.create({
          whiteboardId,
          layerId: '',
          assetId: null,
          position,
          size,
          rotation,
        })
        updates.send(event);
      }
    };
    runHandler(message, handlers);
  };
  const close = () => {
    cleanup.run();
  };
  return {
    close,
    send,
    recieve,
  };
};
export const createWhiteboardClientChannel = () => {};
