import { DocSheet, FramePresenter, markdownToSheet } from "../ComponentDoc/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { universeDocContext } from "../Universe/docs.ts";
import { createJournalBackend } from "./backend.ts";
import { act, network, simpleSystem, actCommon } from "./deps.ts";
import { Game } from "./models.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { createRoutes } from "./routes.ts";
import { createRemoteJournalService } from "./service.ts";
import { gameRESTDef, gameSystemDef } from "./system.ts";
import { JournalScreen, JournalScreenEvent } from './ui/mod.ts';

const { h, useEffect, useState } = act;

const demo = () => {
  const { backend, world } = universeDocContext.useDocContext()

  return [
    h(SystemComponentsPreview, {
      world,
      components: backend.journal.game as unknown as simpleSystem.Components<simpleSystem.SimpleSystemType>,
      systemDef: gameSystemDef
    })
  ]
}
const screen = () => {
  const { backend, world, demo } = universeDocContext.useDocContext()

  const [now, setNow] = useState(Date.now())

  const allGames = actCommon.useAsync(() =>
    backend.journal.game.service.list({ gamePart: 'all' }), [now]);

  if (!allGames)
    return null;

  const [selectedGameId, setSelectedGameId] = useState(allGames[0]?.id || null);

  const selectedGame = selectedGameId && allGames.find(game => game.id === selectedGameId) || null;

  const allRooms = actCommon.useAsync(async () =>
      selectedGame
      && await backend.carpentry.room.service.list({ gameId: selectedGame.id }),
    [selectedGame, now]
  ) || [];

  const onEvent = async (event: JournalScreenEvent) => {
    switch (event.type) {
      case 'game-select':
        return setSelectedGameId(event.gameId);
      case 'game-create': {
        const newGame = await backend.journal.game.service.create({ name: event.name });
        setNow(Date.now());
        return setSelectedGameId(newGame.id);
      }
    }
  }

  return [
    h(FramePresenter, {}, [
      h(JournalScreen, {
        onEvent,
        allGames,
        rooms: allRooms.map(r => ({ ...r, players: Math.floor(Math.random() * 10) })),
        selectedGame: selectedGame,
      }),
    ]),
  ]
}

export const journalDocs: DocSheet[] = [
  markdownToSheet('Journal', readme, { demo, screen }, null, 'Universe')
];