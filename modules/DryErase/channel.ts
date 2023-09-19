import { BidirectionalChannel } from "../Data/ChannelCommon/channel.ts";
import { _, rxjs, service } from "./deps.ts";
import { WhiteboardCursor, WhiteboardStroke, WhiteboardVector } from "./models.ts";
import { Protocol } from "./protocol.ts";
import { WhiteboardBackendService, WhiteboardTypes } from "./service.ts";

export type WhiteboardChannel = BidirectionalChannel<
  Protocol["message"]["server"],
  Protocol["message"]["client"]
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
  // TODO: pack the change monitors into the backend service
  service: WhiteboardBackendService,
  changes: service.CommonSystemComponents<
    WhiteboardTypes["cursorSystem"]
  >["changes"],
  strokeChanges: service.CommonSystemComponents<
    WhiteboardTypes["strokeSystem"]
  >["changes"],
): WhiteboardChannel => {
  const cleanup = cleanupCollection();
  const recieve = new rxjs.ReplaySubject<Protocol["message"]["server"]>(Infinity, Infinity);

  const cursorChannel = changes({ whiteboardId });
  cleanup.register(() => cursorChannel.close());

  const strokeChannel = strokeChanges({ whiteboardId });
  cleanup.register(() => strokeChannel.close());

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

  let cursor: WhiteboardCursor | null = null;
  let stroke: WhiteboardStroke | null = null;
  let position: WhiteboardVector | null = null;

  const init = async () => {
    const createdCursor = await service.cursor.create({
      whiteboardId,
      ownerId: userId,
      position: { x: 0, y: 0 },
    });
    cursor = createdCursor;
    cleanup.register(() => service.cursor.delete({ whiteboardId, cursorId: createdCursor.id }))
    recieve.next({
      type: 'initialize',
      cursors: await service.cursor.list({ whiteboardId })
    })
  }
  init();

  const updateStroke = _.throttle(async (position: WhiteboardVector) => {
    if (stroke)
      stroke = await service.stroke.update({
        whiteboardId,
        strokeId: stroke.id,
      }, { ...stroke, points: [...stroke.points, { position, width: 1 }] })
  }, 100);
  const send = (message: Protocol["message"]["client"]) => {
    const handlers: ChannelHandlerMap<Protocol["message"]["client"]> = {
      async "pointer-move"(event) {
        position = event.position;
        if (!cursor)
          return;
        await service.cursor.update(
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
        stroke = await service.stroke.create({
          whiteboardId, layerId: '',
          brush: { color: 'blue', mode: 'add' },
          points: position && [{ position, width: 1 }] || [],
        })
      },
      'stroke-end'() {
        stroke = null;
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
