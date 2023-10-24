import { m } from "../deps.ts";
import { AssertEqual } from "./assert.ts";

export type SimpleSystemType = {
  partitionName: string,
  sortName: string,
  resourceName: string,

  resource: m.ModeledType;
  create: m.ModeledType;
  update: m.ModeledType;
};
export type SimpleSystemTypeResource<T extends SimpleSystemType> = T["resource"];
export type SimpleSystemTypeResourceModel<T extends SimpleSystemType> = m.ModelOf2<T["resource"]>;
export type SimpleSystemTypeCreate<T extends SimpleSystemType> = T["create"];
export type SimpleSystemTypeUpdate<T extends SimpleSystemType> = T["update"];

export type SimpleSystemDefinition<T extends SimpleSystemType> = {
  key: string,
  names: {
    partition: T["partitionName"],
    sort: T["sortName"],
    resource: T["resourceName"]
  },
  models: {
    resource: SimpleSystemTypeResourceModel<T>,
    create: m.ModelOf2<T["create"]>,
    update: m.ModelOf2<T["update"]>,
  }
}

export type TypeOfSimpleSystem<T extends SimpleSystemDefinition<SimpleSystemType>> = {
  partitionName: T["names"]["partition"],
  sortName: T["names"]["sort"],
  resourceName: T["names"]["resource"],

  resource: m.OfModelType<T["models"]["resource"]>,
  create: m.OfModelType<T["models"]["create"]>,
  update: m.OfModelType<T["models"]["update"]>,
};

const mySimpleSystem = {
  key: 'StuffSystem',
  names: {
    partition: 'gameId',
    sort: 'stuffId',
    resource: 'stuff'
  },
  models: {
    resource: m.object({ hello: m.literal('world') }),
    create: m.object({}),
    update: m.object({}),
  }
} as const
type TestMySimpleSystem = AssertEqual<
  TypeOfSimpleSystem<typeof mySimpleSystem>,
  SimpleSystemType
>;