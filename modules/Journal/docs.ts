import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { universeDocContext } from "../Universe/docs.ts";
import { createJournalBackend } from "./backend.ts";
import { act, network, simpleSystem } from "./deps.ts";
import { Game } from "./models.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { createRoutes } from "./routes.ts";
import { createRemoteJournalService } from "./service.ts";
import { gameRESTDef, gameSystemDef } from "./system.ts";

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

export const journalDocs: DocSheet[] = [
  markdownToSheet('Journal', readme, { demo })
];