import { CRUDService, CRUDType } from "../crudService.ts";
import { AssertEqual } from "./assert.ts";
import { Atoms } from "./atoms.ts";
import { SimpleSystemDefinition, SimpleSystemType } from "./system.ts";

export type ServiceType<T extends SimpleSystemType> = {
  resource: T["resource"],
  create: T["create"],
  update: T["update"],
  id: { [key in T["partitionName"]]: string } & { [key in T["sortName"]]: string },
  filter: { [key in T["partitionName"]]: string }
};
type TestServiceDefinition = AssertEqual<ServiceType<SimpleSystemType>, CRUDType>

export type Service<T extends SimpleSystemType> = CRUDService<ServiceType<T>>;

type OptionalAsync<T> = Promise<T> | T;
export type ServiceImplementation<T extends SimpleSystemType> = {
  create: (input: T["create"]) => OptionalAsync<T["resource"]>;
  update: (previous: T["resource"], input: T["update"]) => OptionalAsync<T["resource"]>;
  calculateKey: (input: T["resource"]) => {
    part: string
    sort: string
  };
} 

export const createService = <T extends SimpleSystemType>(
  atoms: Atoms<T>,
  definition: SimpleSystemDefinition<T>,
  implementation: ServiceImplementation<T>
): Service<T> => {
  return {
    async create(create) {
      const resource = await implementation.create(create);
      const keys = implementation.calculateKey(resource);
      await atoms.store.put(keys, resource);
      atoms.channel.send({ resource, type: 'create', create });
      return resource;
    },
    async read(address) {
      const key = {
        part: address[definition.names.partition],
        sort: address[definition.names.sort],
      } as const;
      return await atoms.store.get(key);
    },
    async update(address, update) {
      const key = {
        part: address[definition.names.partition],
        sort: address[definition.names.sort],
      } as const;
      const previousItem = await atoms.store.get(key);
      const nextItem = await implementation.update(previousItem, update);
      await atoms.store.put(key, nextItem);
      atoms.channel.send({ resource: nextItem, type: 'update', update });
      return nextItem;
    },
    async delete(address) {
      const key = {
        part: address[definition.names.partition],
        sort: address[definition.names.sort],
      } as const;
      const resource = await atoms.store.delete(key);
      atoms.channel.send({ resource, type: 'delete' });
      return resource;
    },
    async list(filter) {
      const part = filter[definition.names.partition];
      const results = await atoms.store.query({ part, type: "all" });
      return results.map((r) => r.value);
    }
  }
}