import { channel, m, rxjs, journal, sesame, janitor } from '../deps.ts';
import { RoomID, roomContentDef } from '../room.ts';
import { Backend } from '../backend.ts';

export const roomChannelDef = {
  incoming: m.union2([
    m.object({
      type: m.literal('content-update'),
      content: roomContentDef, 
    }),
  ]),
  outgoing: m.literal(null),
} as const;
export type RoomChannelType = channel.OfChannelType<typeof roomChannelDef>;

export const createRoomChannel = (
  backend: Backend,
  gameId: journal.GameID,
  roomId: RoomID,
  user: sesame.models.SesameUser,
): channel.Channel<RoomChannelType> => {
  const cleanup = janitor.createCleanupTask()

  const recieve = new rxjs.Subject<RoomChannelType["Incoming"]>();

  const roomUpdates = backend.roomContent.atoms.band.connect({ gameId, roomId });
  const roomUpdateSubscription = roomUpdates.recieve.subscribe((event) => {
    recieve.next({
      type: 'content-update',
      content: event.resource,
    })
  });
  cleanup.register(() => {
    roomUpdates.close();
    roomUpdateSubscription.unsubscribe();
  });

  return {
    recieve,
    send(message) {
      console.log('now why would you do that')
    },
    close() {
      cleanup.run();
    }
  }
};
