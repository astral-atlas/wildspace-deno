import {
  DocSheet,
  markdownToSheet,
  createDocContext,
} from "../ComponentDoc/mod.ts";
import * as universe from "../Universe/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { createBackend } from "./backend.ts";
import { createCarpentryChannel } from "./channel.ts";
import { GatewayChannelType, GatewayEevee, GatewaySplitter } from './channels/mod.ts'
import { act, sesame, simpleSystem, channel } from "./deps.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { roomContentSystemDef, roomSystemDef } from "./system.ts";
import { universeDocContext } from "../Universe/docs.ts";

const { h } = act;

const { Provider, useDocContext } = createDocContext(async (cleanup, { backend, demo, world }) => {
  const carpentryChannel = createCarpentryChannel(
    backend.carpentry,
    backend.sesame,
    demo.room.gameId,
    demo.room.id
  );
  const authed = await channel.createEeveeClient(carpentryChannel).init({
    id: demo.session.token.id,
    secret: demo.session.secret,
    userId: demo.user.id,
  })

  const plex = channel.createMultiplexerClient<channel.EeveeTransportType<GatewayEevee>>(authed);

  const splittableChannel = await channel.createEeveeClient<GatewayEevee>(plex.open()).init({
    type: 'room'
  })
  const roomChannel = channel.createSplitterClient<GatewaySplitter, 'room'>('room', splittableChannel);

  return { backend, roomChannel, authed, carpentryChannel, world };
}, universeDocContext.useDocContext);

const ChannelDemo = () => {
  const { roomChannel } = useDocContext();

  const onClick = () => {
    roomChannel.send(null);
  };

  return h("button", { onClick }, "Login");
};

const BackendPreview = () => {
  const { backend, world } = useDocContext();
  return [
    h(SystemComponentsPreview, {
      components: backend.carpentry
        .room as unknown as simpleSystem.Components<simpleSystem.SimpleSystemType>,
      world,
      systemDef: roomSystemDef,
    }),
    h(SystemComponentsPreview, {
      components: backend.carpentry
        .roomContent as unknown as simpleSystem.Components<simpleSystem.SimpleSystemType>,
      world,
      systemDef: roomContentSystemDef,
    }),
  ];
};

const components = {
  ChannelDemo,
  BackendPreview,
};

export const carpentryDocs: DocSheet[] = [
  markdownToSheet("Carpentry", readme, components, Provider, 'Universe'),
];
