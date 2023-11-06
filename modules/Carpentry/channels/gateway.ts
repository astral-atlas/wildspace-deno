import { channel, rxjs, sesame, m, journal, stage } from "../deps.ts";
import { createRoomChannel, roomChannelDef } from "./room.ts";
import { Backend } from "../backend.ts";
import { RoomID } from "../room.ts";

const gatewayChannelDefs = {
  channels: {
    room: roomChannelDef,
    stage: stage.stageChannelDef,
  },
} as const;
export type GatewaySplitter = channel.OfSplitterType<typeof gatewayChannelDefs>;

const gatewaySplitDef =
  channel.createSplitterChannelDefinition<GatewaySplitter>(gatewayChannelDefs);

// TODO: man, splitter + eevee combos are hard to think about.
// maybe they should be refactored into a single function?
const gatewayEeveeDef = {
  incoming: gatewaySplitDef.incoming,
  outgoing: gatewaySplitDef.outgoing,
  init: m.union2([
    m.object({ type: m.literal("room") }),
    m.object({ type: m.literal("stage"), sceneNodeId: m.string }),
  ] as const),
  initResponse: m.literal(null)
} as const;
export type GatewayEevee = channel.OfEeveeType<typeof gatewayEeveeDef>;

export const gatewayChannelDef = channel.createMultiplexChannelDefinition(
  channel.createEeveeTransportDefinition<GatewayEevee>(gatewayEeveeDef)
);

export type GatewayChannelType = channel.MultiplexerChannelType<
  channel.EeveeTransportType<GatewayEevee>
>;

export const createGatewayChannel = (
  backend: Backend,
  gameId: journal.GameID,
  roomId: RoomID,
  user: sesame.models.SesameUser
): channel.Multiplexer<channel.EeveeTransportType<GatewayEevee>> => {
  const multiplexer = channel.createMultiplexer<channel.EeveeTransportType<GatewayEevee>>(
    () => {
      return channel.createEeveeChannel<GatewayEevee>(
        gatewayEeveeDef,
        async (init) => {
          switch (init.type) {
            case "room":
              return {
                response: null,
                channel: channel.createSplitter<GatewaySplitter, "room">(
                  "room",
                  createRoomChannel(backend, gameId, roomId, user)
                ),
              }
            case "stage":
              return {
                response: null,
                channel: channel.createSplitter<GatewaySplitter, "stage">(
                  "stage",
                  await stage.createStageChannel(
                    backend.stageBackend,
                    gameId,
                    init.sceneNodeId
                  )
                )
              };
          }
          throw new Error();
        }
      );
    }
  );

  return multiplexer;
};
