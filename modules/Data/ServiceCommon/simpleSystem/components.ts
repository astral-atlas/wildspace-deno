import { m } from "../deps.ts";
import { SimpleSystemDefinition, SimpleSystemType, TypeOfSimpleSystem } from "./system.ts";
import { Service, ServiceImplementation, createService } from "./service.ts";
import { World } from "./world.ts";
import { Atoms, createAtoms } from "./atoms.ts";

export type Components<T extends SimpleSystemType> = {
  atoms: Atoms<T>,
  service: Service<T>,
}

export type Implementation<T extends SimpleSystemType> = {
  definition: SimpleSystemDefinition<T>,
  service: ServiceImplementation<T>,
}

const mySimpleSystem = {
  key: 'StuffSystem',
  names: {
    partition: 'gameId',
    sort: 'stuffId',
    resource: 'stuff'
  },
  models: {
    resource: m.object({ hello: m.literal('world') }),
    create: m.object({ none: m.literal('whatsovever') }),
    update: m.object({}),
  }
} as const
type MySimpleSystem = TypeOfSimpleSystem<typeof mySimpleSystem>;

export const createComponents = <T extends SimpleSystemType>(
  world: World,
  implementation: Implementation<T>
) => {
  const atoms = createAtoms(world, implementation.definition);
  const service = createService(atoms, implementation.definition, implementation.service);

  return { atoms, service };
}
