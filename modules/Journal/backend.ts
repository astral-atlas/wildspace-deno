import { nanoid, sesameModels, simpleSystem } from "./deps.ts";
import {
  GameSystem, gameSystemDef,
  InvitationSystem, invitationSystemDef,
} from "./system.ts";

export type JournalBackend = {
  game: simpleSystem.Components<GameSystem>,
  invitation: simpleSystem.Components<InvitationSystem>,

  getUserActorForGame: (gameId: string, userId: string) => Promise<sesameModels.Actor>,
}

export const createJournalBackend = (world: simpleSystem.World): JournalBackend => {
  const game = simpleSystem.createComponents<GameSystem>(world, {
    definition: gameSystemDef,
    service: {
      create({ name }) {
        return {
          id: nanoid(),
          name
        }
      },
      update(game, { name }) {
        return { ...game, name };
      },
      calculateKey(game) {
        return {
          part: 'all',
          sort: game.id,
        }
      }
    }
  })

  const invitationService = simpleSystem.createComponents<InvitationSystem>(world, {
    definition: invitationSystemDef,
    service: {
      create(input) {
        return input;
      },
      update(previous,input) {
        throw new Error(`Invitations are immutable`);
      },
      calculateKey(input) {
        return {
          part: input.gameId,
          sort: input.inviteeId,
        }
      },
    }
  });

  const getUserActorForGame = async (gameId: string, userId: string): Promise<sesameModels.Actor> => {
    try {
      const invitation = await invitationService.service.read({ gameId, userId });
      switch (invitation.role) {
        case 'user':
          return { type: 'user', userId }
        case 'admin':
          return { type: 'admin', userId }
        default:
          throw new Error();
      }
    } catch {
      return { type: 'guest' } as const;
    }
  }

  return { game, invitation: invitationService, getUserActorForGame };
}