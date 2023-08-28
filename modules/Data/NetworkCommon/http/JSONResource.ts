import { Model, ModelOf, ModelsByType, OfModelType } from "../../../Models/model.ts";
import { m } from "../deps.ts";
import {
  JSONTransactionDefinition,
  JSONTransactionImplementation,
  JSONTransactionServiceDefinition,
  JSONValue,
  QueryValue,
  createJSONTransactionClient,
} from "./JSONTransaction.ts";
import { HTTPResponse } from "./common.ts";

export type JSONResourceType = {
  resource: JSONValue;

  post:   JSONValue;
  patch:  JSONValue;

  filter: QueryValue;
  id:     QueryValue;
};

export type JSONResourceDefinition<T extends JSONResourceType> = {
  path: string;
  name: string;

  resource: m.ModelOf<T["resource"]>;
  post:     m.ModelOf<T["post"]>;
  patch:    m.ModelOf<T["patch"]>;

  filter:   m.ModelOf<T["filter"]>;
  id:       m.ModelOf<T["id"]>;
};
export type OfJSONResourceType<T extends JSONResourceDefinition<JSONResourceType>> = {
  resource: OfModelType<T["resource"]>,
  post:     OfModelType<T["post"]>,
  patch:    OfModelType<T["patch"]>,
  filter:   OfModelType<T["filter"]>,
  id:       OfModelType<T["id"]>,
}

export type JSONResourceClient<T extends JSONResourceType> = {
  get: (id: T["id"]) => Promise<[T["resource"], HTTPResponse]>;
  list: (query: T["filter"]) => Promise<[T["resource"][], HTTPResponse]>;
  post: (submission: T["post"]) => Promise<[T["resource"], HTTPResponse]>;
  delete: (id: T["id"]) => Promise<[T["resource"], HTTPResponse]>;
  put: (resource: T["resource"], id: T["id"]) => Promise<[T["resource"], HTTPResponse]>;
  patch: (resource: T["patch"], id: T["id"]) => Promise<[ T["resource"], HTTPResponse]>;
};

export type JSONResourceTransactionTypes<T extends JSONResourceType> = {
  get: {
    request: {};
    response: T["resource"];
    query: T["id"];
  };
  list: {
    request: {};
    response: T["resource"][];
    query: T["filter"];
  };
  post: {
    request: T["post"];
    response: T["resource"];
    query: {};
  };

  put: {
    request: T["resource"];
    response: T["resource"];
    query: T["id"];
  };
  patch: {
    request: T["patch"];
    response: T["resource"];
    query: T["id"];
  };
  delete: {
    request: Record<string, never>;
    response: T["resource"];
    query: T["id"];
  };
};
export type JSONResourceTransactionDefinitions<T extends JSONResourceType> = {
  get: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["get"]>;
  list: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["list"]>;
  post: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["post"]>;

  put: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["put"]>;
  patch: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["patch"]>;
  delete: JSONTransactionDefinition<JSONResourceTransactionTypes<T>["delete"]>;
};

type MyResource = {
  resource: { thing: string };
  post: { thing: string };
  patch: { thing: string };
  filter: { thing: string };
  id: { thing: string };
}
type Trans = JSONResourceTransactionDefinitions<MyResource>;
type A = m.OfModelType<Trans["get"]["response"]>

export const createJSONResourceTransactionDefinitions = <
  T extends JSONResourceType
>(
  definition: JSONResourceDefinition<T>
): JSONResourceTransactionDefinitions<T> => {
  return {
    list: {
      path: definition.path,
      name: definition.name,
      method: "GET",
      request: m.never,
      response: m.array(definition.resource),
      query: definition.filter,
    } as JSONResourceTransactionDefinitions<T>["list"],
    get: {
      path: '/' + [...definition.path.split('/'), "byId"].filter(Boolean).join("/"),
      name: definition.name,
      method: "GET",
      request: m.never,
      response: definition.resource,
      query: definition.id,
    } as JSONResourceTransactionDefinitions<T>["get"],
    post: {
      path: definition.path,
      name: definition.name,
      method: "POST",
      request: definition.post,
      response: definition.resource,
      query: m.never,
    },
    put: {
      path: definition.path,
      name: definition.name,
      method: "PUT",
      request: definition.resource,
      response: definition.resource,
      query: definition.id,
    },
    patch: {
      path: definition.path,
      name: definition.name,
      method: "PATCH",
      request: definition.patch,
      response: definition.resource,
      query: definition.id,
    },
    delete: {
      path: definition.path,
      name: definition.name,
      method: "DELETE",
      request: m.never,
      response: definition.resource,
      query: definition.id,
    },
  };
};

export const createJSONResourceClient = <T extends JSONResourceType>(
  definition: JSONResourceDefinition<T>,
  implementation: JSONTransactionImplementation,
  service: JSONTransactionServiceDefinition
): JSONResourceClient<T> => {
  const transactionDefinitions =
    createJSONResourceTransactionDefinitions(definition);

  const clients = {
    get: createJSONTransactionClient(
      implementation,
      transactionDefinitions.get,
      service
    ),
    post: createJSONTransactionClient(
      implementation,
      transactionDefinitions.post,
      service
    ),
    put: createJSONTransactionClient(
      implementation,
      transactionDefinitions.put,
      service
    ),
    list: createJSONTransactionClient(
      implementation,
      transactionDefinitions.list,
      service
    ),
    delete: createJSONTransactionClient(
      implementation,
      transactionDefinitions.delete,
      service
    ),
    patch: createJSONTransactionClient(
      implementation,
      transactionDefinitions.patch,
      service
    ),
  };

  return {
    async get(id) {
      return await clients.get.start({ query: id });
    },
    async list(filter) {
      return await clients.list.start({ query: filter });
    },
    async post(resource) {
      return await clients.post.start({ request: resource });
    },
    async put(resource, id) {
      return await clients.put.start({ request: resource, query: id });
    },
    async patch(patch, id) {
      return await clients.patch.start({ request: patch, query: id });
    },
    async delete(id) {
      return await clients.delete.start({ query: id });
    },
  };
};
