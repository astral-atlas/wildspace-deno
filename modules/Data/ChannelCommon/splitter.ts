import { ChannelDefinition, ChannelType, OfChannelType, BidirectionalChannel } from "./channel.ts";
import { m, rxjs } from './deps.ts';

export type SplitterType = {
  [key: string]: ChannelType;
};
export type SplitterDefinition<T extends SplitterType> = {
  channels: { [key in keyof T]: ChannelDefinition<T[key]> };
};
export type SplitterImplementation<T extends SplitterType> = {
  channels: {
    [key in keyof T]: BidirectionalChannel<T[key]["Incoming"], T[key]["Outgoing"]>
  };
};
export type OfSplitterType<T extends SplitterDefinition<SplitterType>> = {
  [key in keyof T["channels"]]: OfChannelType<T["channels"][key]>;
};
export type SplitterChannelType<T extends SplitterType> = {
  Incoming: {
    [key in keyof T]: key extends string ? { key: key; value: T[key]["Incoming"] } : never;
  }[keyof T];
  Outgoing: {
    [key in keyof T]: [key] extends [string] ? { key: key; value: T[key]["Outgoing"] } : never;
  }[keyof T];
};
export type SplitterTransport<T extends SplitterType> = BidirectionalChannel<
  SplitterChannelType<T>["Incoming"],
  SplitterChannelType<T>["Outgoing"]
>

export const createSplitterChannelDefinition = <T extends SplitterType>(
  def: SplitterDefinition<SplitterType>,
): ChannelDefinition<SplitterChannelType<T>> => {
  const incoming = m.union2(Object.entries(def.channels)
    .map(([key, channelDef]) => {
      return m.object({ key: m.literal(key), value: channelDef.incoming })
    })) as ChannelDefinition<any>["incoming"] as ChannelDefinition<SplitterChannelType<T>>["incoming"];
  const outgoing = m.union2(Object.entries(def.channels)
    .map(([key, channelDef]) => {
      return m.object({ key: m.literal(key), value: channelDef.outgoing })
    })) as ChannelDefinition<any>["outgoing"] as ChannelDefinition<SplitterChannelType<T>>["outgoing"];

  return {
    incoming,
    outgoing,
  }
};

export const createSplitterEnum = <T extends SplitterType>(
  def: SplitterDefinition<SplitterType>,
): { type: 'enum', cases: (keyof T)[] } => {
  return m.set(Object.keys(def))
}

export const createSplitter = <T extends SplitterType, Key extends string>(
  key: Key,
  channel: SplitterImplementation<T>["channels"][Key]
): SplitterTransport<T> => {
  return {
    recieve: channel.recieve.pipe(rxjs.map(value => {
      return {
        key: key as SplitterChannelType<T>["Incoming"]["key"],
        value
      } as SplitterChannelType<T>["Incoming"];
    })),
    send(message) {
      if (message.key === key)
        channel.send(message.value);
    },
    close: channel.close,
  }
}

export const createSplitterClient = <T extends SplitterType, Key extends keyof T>(
  key: Key,
  splitChannel: SplitterTransport<T>,
): SplitterImplementation<T>["channels"][Key] => {

  return {
    recieve: splitChannel.recieve
      .pipe(rxjs.filter(message => message.key === key))
      .pipe(rxjs.map(message => message.value)),
    send(value) {
      splitChannel.send({
        key,
        value
      } as SplitterChannelType<T>["Incoming"])
    },
    close: splitChannel.close,
  }
}