import { rxjs } from "../SesameDataService/deps.ts";
import { m } from './deps.ts';

export type ChannelType = {
  Incoming: m.ModeledType,
  Outgoing: m.ModeledType,
}
export type OfChannelType<T extends ChannelDefinition<ChannelType>> = {
  Incoming: m.OfModelType<T["incoming"]>,
  Outgoing: m.OfModelType<T["outgoing"]>,
}
export type ChannelDefinition<T extends ChannelType> = {
  incoming: m.ModelOf2<T["Incoming"]>,
  outgoing: m.ModelOf2<T["Outgoing"]>,
}

export type Channel<T extends ChannelType> = BidirectionalChannel<
  T["Incoming"],
  T["Outgoing"]
>;

export type BidirectionalChannel<Incoming, Outgoing> =
  & IncomingChannel<Incoming> 
  & OutgoingChannel<Outgoing>;

export type UniformChannel<Message> =
  & IncomingChannel<Message> 
  & OutgoingChannel<Message>;

export type IncomingChannel<Incoming> = {
  recieve: rxjs.Observable<Incoming>,
  close: () => void,
}
export type OutgoingChannel<Outgoing> = {
  send: (message: Outgoing) => unknown,
  close: () => void,
}
