import { rxjs } from "../SesameDataService/deps.ts";
import { BidirectionalChannel } from "./channel.ts";
import { UniformChannel } from "./mod.ts";

export const createMemoryBidirectionalChannel = <
  Left,
  Right
>(): [BidirectionalChannel<Left, Right>, BidirectionalChannel<Right, Left>] => {
  const leftSubject = new rxjs.Subject<Left>()
  const rightSubject = new rxjs.Subject<Right>()

  const leftChannel: BidirectionalChannel<Left, Right> = {
    send(message) {
      rightSubject.next(message);
    },
    close() {},
    recieve: leftSubject,
  }
  const rightChannel: BidirectionalChannel<Right, Left> = {
    send(message) {
      leftSubject.next(message);
    },
    close() {},
    recieve: rightSubject,
  };
  return [leftChannel, rightChannel];
};

export const createEchoChannel = <Message>(): UniformChannel<Message> => {
  const recieve = new rxjs.Subject<Message>();
  const send = (message: Message) => {
    recieve.next(message);
  };
  const close = () => {

  };
  return { send, close, recieve };
}