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
} as const;
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
} as const;
export type SecretSystem = simpleSystem.TypeOfSimpleSystem<
  typeof secretSystemDef
>;

export const sessionTokenDef = {
  key: 'sessionToken',
  names: {
    partition: 'userId',
    sort: 'tokenId',
    resource: 'token'
  },
  models: {
    resource: sesameModels.sessionTokenDef,
    create: m.object({
      secretId: m.string,
      userId: m.string,
      name: m.string
    }),
    update: m.union2([
      m.object({
        type: m.literal('expire'),
      }),
      m.object({
        type: m.literal('use'),
        lastUsed: m.number,
      }),
    ])
  }
} as const
export type SessionTokenSystem = simpleSystem.TypeOfSimpleSystem<
  typeof sessionTokenDef
>;
