import * as deps from './deps.ts';

export type Backend = {
  artifact: deps.artifact.Backend,
  sesame: deps.sesame.SesameBackend,
  journal: deps.journal.JournalBackend,
  stage: deps.stage.Backend,
  presentation: deps.presentation.PresentationBackend,
  carpentry: deps.carpentry.Backend,
  clerk: deps.clerk.Backend,
  //dryErase: deps.dryErase.,
}

export const createBackend = (world: deps.simpleSystem.World): Backend => {
  const sesame = deps.sesame.createSesameBackend(world);
  const journal = deps.journal.createJournalBackend(world);
  const stage = deps.stage.createBackend(world);
  const presentation = deps.presentation.createBackend(world);
  const artifact = deps.artifact.createBackend(world);
  const clerk = deps.clerk.createBackend(world);

  const carpentry = deps.carpentry.createBackend(world, stage);

  return {
    artifact,
    sesame,
    journal,
    stage,
    presentation,
    carpentry,
    clerk,
  }
}