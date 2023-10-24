import { rxjs } from "../SesameDataService/deps.ts";

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
