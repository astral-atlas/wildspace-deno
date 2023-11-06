import { channel, rxjs, sesame, m } from '../deps.ts';

type AuthenticatedEevee<T extends channel.ChannelType> = {
  Incoming: T["Incoming"],
  Outgoing: T["Outgoing"],
  Init: sesame.models.PortableSessionTokenContents,
  InitResponse: 'authenticated'
};

export type AuthenticatedChannelType<T extends channel.ChannelType> = 
  channel.EeveeTransportType<AuthenticatedEevee<T>>

type AuthenticatedChannel<T extends channel.ChannelType> = channel.Channel<
  AuthenticatedChannelType<T>
>;

/**
 * For a given channel definition, create the Eevee
 * definition
 */
const createEeveeDef = <T extends channel.ChannelType>(
  channelDef: channel.ChannelDefinition<T>,
): channel.EeveeChannelDefinition<AuthenticatedEevee<T>> => {
  return {
    incoming: channelDef.incoming,
    outgoing: channelDef.outgoing,
    init: sesame.models.portableSessionTokenContentsDef,
    initResponse: m.literal('authenticated')
  } as channel.EeveeChannelDefinition<AuthenticatedEevee<T>>;
}

export const createAuthenticatedChannelDef = <T extends channel.ChannelType>(
  channelDef: channel.ChannelDefinition<T>,
): channel.ChannelDefinition<AuthenticatedChannelType<T>> => {

  return channel.createEeveeTransportDefinition<AuthenticatedEevee<T>>(
    createEeveeDef<T>(channelDef)
  );
}

export const createAuthenticatedChannel = <T extends channel.ChannelType>(
  channelDef: channel.ChannelDefinition<T>,
  backend: sesame.SesameBackend,
  createAuthenticatedChannel: (user: sesame.models.SesameUser) => channel.Channel<T>
): AuthenticatedChannel<T> => {
  const eeveeDef = createEeveeDef(channelDef);

  return channel.createEeveeChannel<AuthenticatedEevee<T>>(
    eeveeDef,
    async (init) => {
      const user = await backend.service.validatePortableSessionTokenContents(init)
      if (!user)
        throw new Error();

      return {
        channel: createAuthenticatedChannel(user),
        response: 'authenticated'
      };
    });
};
