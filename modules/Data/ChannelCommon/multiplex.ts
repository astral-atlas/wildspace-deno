import {
  BidirectionalChannel,
  ChannelType,
  ChannelDefinition,
  Channel,
} from "./channel.ts";
import { m, nanoid, rxjs } from "./deps.ts";

export type MultiplexedChannel<Type extends ChannelType> = BidirectionalChannel<
  Type["Incoming"],
  Type["Outgoing"]
>;

export const createMultiplexChannelDefinition = <Type extends ChannelType>(
  channelDef: ChannelDefinition<Type>
): ChannelDefinition<MultiplexerChannelType<Type>> => {
  return {
    incoming: m.union2([
      m.object({
        type: m.literal("close-channel"),
        id: m.string,
      }),
      m.object({
        type: m.literal("open-channel"),
        id: m.string,
      }),
      m.object({
        type: m.literal("message-channel"),
        id: m.string,
        message: channelDef.incoming,
      }),
    ]) as m.ModelOf2<MultiplexerMessage<Type["Incoming"]>>,
    outgoing: m.union2([
      m.object({
        type: m.literal("message-channel"),
        id: m.string,
        message: channelDef.outgoing,
      }),
      m.object({
        type: m.literal("close-channel"),
        id: m.string,
      }),
      m.object({
        type: m.literal("open-channel"),
        id: m.string,
      }),
    ]) as m.ModelOf2<MultiplexerMessage<Type["Outgoing"]>>,
  };
};

export type MultiplexerMessage<TMessage> =
  | { type: "open-channel"; id: string }
  | { type: "close-channel"; id: string }
  | { type: "message-channel"; id: string; message: TMessage };

export const MultiplexerMessageSerializer = {
  encode(message: MultiplexerMessage<unknown>) {
    const payload: number[] = [];
    const encodeString = (value: string) => {
      return payload.push(value.length, ...new TextEncoder().encode(value));
    };
    const type = (
      {
        "open-channel": 0,
        "message-channel": 1,
        "close-channel": 2,
      } as const
    )[message.type];

    payload.push(type);
    encodeString(message.id);
    if (message.type === "message-channel")
      encodeString(JSON.stringify(message.message));

    return Uint8Array.from(payload);
  },
  decode(bytes: Uint8Array): MultiplexerMessage<unknown> {
    let pointer = 0;
    const decodeString = () => {
      const length = bytes[pointer++];
      return new TextDecoder().decode(bytes.slice(pointer, pointer + length));
    };
    const type = bytes[pointer++];
    const id = decodeString();
    switch (type) {
      case 0:
        return { type: "open-channel", id };
      case 1: {
        const message = JSON.parse(decodeString());
        return { type: "message-channel", id, message };
      }
      case 2:
        return { type: "close-channel", id };
      default:
        throw new Error();
    }
  },
};

export type MultiplexerChannelType<Type extends ChannelType> = {
  Incoming: MultiplexerMessage<Type["Incoming"]>;
  Outgoing: MultiplexerMessage<Type["Outgoing"]>;
};

export type Multiplexer<Type extends ChannelType> = Channel<
  MultiplexerChannelType<Type>
> & {
  connect: () => MultiplexedChannel<Type>;
};

export const createMultiplexer = <Type extends ChannelType>(
  createChannel: () => MultiplexedChannel<Type>
): Multiplexer<Type> => {
  const channels = new Map<string, MultiplexedChannel<Type>>();

  const connect = () => {
    const id = nanoid();
    const channel = createChannel();
    recieve.next({ type: "open-channel", id });
    return channel;
  };

  const recieve = new rxjs.Subject<MultiplexerMessage<Type["Incoming"]>>();

  const close = () => {
    recieve.complete();
  };

  return {
    connect,

    recieve,
    send(message) {
      switch (message.type) {
        case "open-channel": {
          const { id } = message;
          const channel = createChannel();
          channel.recieve
            .pipe(
              rxjs.map(
                (message) =>
                  ({
                    type: "message-channel",
                    id,
                    message,
                  } as const)
              )
            )
            .subscribe(recieve);
          return channels.set(id, channel);
        }
        case "message-channel": {
          const channel = channels.get(message.id);
          if (!channel) return;
          return channel.send(message.message);
        }
        case "close-channel": {
          const channel = channels.get(message.id);
          if (!channel) return;
          channel.close();
          return channels.delete(message.id);
        }
      }
    },
    close,
  };
};

export const createMultiplexerClient = <Type extends ChannelType>(
  multiplexedChannel: Channel<MultiplexerChannelType<Type>>
) => {
  const createChannel = (id: string): Channel<Type> => {
    const recieve = multiplexedChannel.recieve.pipe(
      rxjs.mergeMap((e) =>
        e.type === "message-channel" && e.id === id ? [e.message] : []
      )
    );

    return {
      recieve,
      send(message) {
        multiplexedChannel.send({ type: "message-channel", message, id });
      },
      close() {
        multiplexedChannel.send({ type: "close-channel", id });
      },
    };
  }
  const open = (): Channel<Type> => {
    const id = nanoid();
    const openedChannel = createChannel(id);
    multiplexedChannel.send({ type: "open-channel", id });
    return openedChannel;
  };
  
  const onChannel = multiplexedChannel.recieve
    .pipe(rxjs.mergeMap(e => e.type === 'open-channel' ? [e] : []))
    .pipe(rxjs.map(openChannel => createChannel(openChannel.id)))

  return {
    onChannel,
    open,
  };
};
