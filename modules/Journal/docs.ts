import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { createJournalBackend } from "./backend.ts";
import { act, network, simpleSystem } from "./deps.ts";
import { Game } from "./models.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { createRoutes } from "./routes.ts";
import { createRemoteJournalService } from "./service.ts";
import { gameRESTDef } from "./system.ts";

const { h, useEffect } = act;

const demo = () => {
  useEffect(() => {
    const start = async () => {
      // Setup systems
      const world = simpleSystem.createMemoryWorld();
      const backend = createJournalBackend(world);
      const routes = createRoutes(backend);
      const router = network.createRouter(routes);

      // Setup fake internet
      const internet = network.createMemoryInternet();

      // Create server
      const net = network.createMemoryNetworkService(internet, 'www.games.com');
      const server = await net.createHTTPServer(80)
      server.connection.subscribe(router.handleHTTP);

      // Create client
      const httpClient = net.createHTTPClient()
      const domainClient = network.createDomainClient(
        new URL('http://www.games.com'),
        { type: 'none'},
        httpClient,
      );
      const client = createRemoteJournalService(domainClient);

      // aaaand, action!
      const newGame: Game = await client.game.create({ name: 'MyGame!' })

      // Lets log our results
      console.log(newGame);
      const gameStore = world.partitions.get('games');
      if (gameStore) {
        // Dump the internal state of our database
        const databaseContents = gameStore.memory()
        console.log(databaseContents)
      }

      // And do a network read back!
      console.log(await client.game.read({ gameId: newGame.id, gamePart: 'all' }));
    }
    start()
      .catch(console.error)
  }, []);

  return h('div', {}, 'Da demo!')
}

export const journalDocs: DocSheet[] = [
  markdownToSheet('Journal', readme, { demo })
];