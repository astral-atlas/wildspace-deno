import { BidirectionalChannel, Channel, ChannelDefinition } from "./channel.ts";
import { m, rxjs } from "./deps.ts";

export type EeveeChannelType = {
  Incoming: m.ModeledType;
  Outgoing: m.ModeledType;
  Init: m.ModeledType;
  InitResponse: m.ModeledType;
};
export type EeveeChannelDefinition<T extends EeveeChannelType> = {
  incoming: m.ModelOf2<T["Incoming"]>;
  outgoing: m.ModelOf2<T["Outgoing"]>;
  init: m.ModelOf2<T["Init"]>;
  initResponse: m.ModelOf2<T["InitResponse"]>;
};
export type OfEeveeType<T extends EeveeChannelDefinition<EeveeChannelType>> = {
  Incoming: m.OfModelType<T["incoming"]>;
  Outgoing: m.OfModelType<T["outgoing"]>;
  Init: m.OfModelType<T["init"]>;
  InitResponse: m.OfModelType<T["initResponse"]>;
};

export type EeveeOutgoing<T extends EeveeChannelType> =
  | { type: "init"; init: T["Init"] }
  | { type: "message"; message: T["Outgoing"] };
export type EeveeIncoming<T extends EeveeChannelType> =
  | { type: "init-complete"; initResponse: T["InitResponse"] }
  | { type: "message"; message: T["Incoming"] };

export type EeveeInitializedChannel<T extends EeveeChannelType> =
  BidirectionalChannel<T["Incoming"], T["Outgoing"]>;

export type EeveeTransportType<T extends EeveeChannelType> = {
  Incoming: EeveeIncoming<T>;
  Outgoing: EeveeOutgoing<T>;
};

export const createEeveeTransportDefinition = <T extends EeveeChannelType>(
  def: EeveeChannelDefinition<T>
): ChannelDefinition<EeveeTransportType<T>> => {
  return {
    incoming: m.union2([
      m.object({
        type: m.literal("init-complete"),
        initResponse: def.initResponse,
      }) as m.ModelOf2<EeveeIncoming<T>>,
      m.object({
        type: m.literal("message"),
        message: def.incoming,
      }) as m.ModelOf2<EeveeIncoming<T>>,
    ] as const),
    outgoing: m.union2([
      m.object({ type: m.literal("init"), init: def.init }) as m.ModelOf2<
        EeveeOutgoing<T>
      >,
      m.object({
        type: m.literal("message"),
        message: def.outgoing,
      }) as m.ModelOf2<EeveeOutgoing<T>>,
    ] as const),
  };
};

export const createEeveeChannel = <T extends EeveeChannelType>(
  definition: EeveeChannelDefinition<T>,
  createChannel: (init: T["Init"]) => Promise<{
    channel: EeveeInitializedChannel<T>;
    response: T["InitResponse"];
  }>
): Channel<EeveeTransportType<T>> => {
  let initializedChannel: EeveeInitializedChannel<T> | null = null;

  const recieve = new rxjs.Subject<EeveeTransportType<T>["Incoming"]>();

  const castInit = m.createModelCaster(definition.init);
  const castOutgoing = m.createModelCaster(definition.outgoing);

  return {
    recieve,
    send(event) {
      switch (event.type) {
        case "init": {
          if (initializedChannel)
            throw new Error(`Already initialized Eevee Channel`);
          const init = castInit(event.init);

          createChannel(init)
            .then(({ channel: newChannel, response }) => {
              initializedChannel = newChannel;
              recieve.next({ type: "init-complete", initResponse: response });
              initializedChannel.recieve
                .pipe(
                  rxjs.map((message) => ({ type: "message", message } as const))
                )
                .subscribe(recieve);
            })
            .catch((error) => {
              recieve.error(error);
            });
          return;
        }
        case "message":
          if (!initializedChannel)
            throw new Error(`Message recieved in uninitialized Eevee Channel`);
          initializedChannel.send(castOutgoing(event.message));
      }
    },
    close() {
      if (initializedChannel) initializedChannel.close();
      recieve.complete();
    },
  };
};

export const createEeveeClient = <T extends EeveeChannelType>(
  transport: Channel<EeveeTransportType<T>>
) => {
  const init = async (init: T["Init"]): Promise<EeveeInitializedChannel<T>> => {
    const promise = rxjs.firstValueFrom(transport.recieve);
    transport.send({ type: "init", init });
    const result = await promise;
    if (result.type !== "init-complete") throw new Error();

    return {
      send(message) {
        transport.send({ type: "message", message });
      },
      recieve: transport.recieve
        .pipe(rxjs.mergeMap(e => e.type === 'message' ? [e.message] : [])),
      close: transport.close,
    };
  };
  return { init };
};
