import { m, sesameModels, simpleSystem } from "./deps.ts";

export const userSystemDef = {
  key: 'user',
  names: {
    partition: 'userPartition',
    sort: 'userId',
    resource: 'user'
  },
  models: {
    resource: sesameModels.userDefinition,
    create: m.object({
      name: m.string,
      password: m.string,
    }),
    update: m.object({
      name: m.nullable(m.string),
      password: m.nullable(m.string),
    }),
  }
}
export type UserSystem = simpleSystem.TypeOfSimpleSystem<
  typeof userSystemDef
>;

export const secretSystemDef = {
  key: 'secret',
  names: {
    partition: 'userId',
    sort: 'secretId',
    resource: 'secret'
  },
  models: {
    resource: sesameModels.secretDefinition,
    create: m.object({
      userId: m.string,
      secretValue: m.string,
    }),
    update: m.literal(null),
  }
}
export type SecretSystem = simpleSystem.TypeOfSimpleSystem<
  typeof secretSystemDef
>;