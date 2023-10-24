import { ModelOf, OfModelType } from "../../Models/model.ts";
import { QueryValue } from "../NetworkCommon/http/JSONTransaction.ts";
import { storage, network, m } from "./deps.ts";

export type ResourceType = {
  readonly [key: string]: m.ModeledType
}

export type CRUDType = {
  resource: m.ModeledType,
  create:   m.ModeledType,
  update:   m.ModeledType,

  id:     QueryValue,
  filter: QueryValue,
};

export type CRUDDefinition<T extends CRUDType> = {
  path: string,
  name: string,

  resource: ModelOf<T["resource"]>,
  create: ModelOf<T["create"]>,
  update: ModelOf<T["update"]>,

  id: ModelOf<T["id"]>,
  filter: ModelOf<T["filter"]>,
};
export type TypeOfCRUDDefinition<T extends CRUDDefinition<CRUDType>> = {
  resource: OfModelType<T["resource"]>,
  create: OfModelType<T["create"]>,
  update: OfModelType<T["update"]>,

  id: OfModelType<T["id"]>,
  filter: OfModelType<T["filter"]>,
}

export const createCRUDDefinition = <T extends CRUDType, A extends CRUDDefinition<T>>(
  definition: A
): A => {
  return definition;
}
export type CRUDImplementation<T extends CRUDType> = {
  create: (value: T["create"]) => Promise<T["resource"]>,
  update: (value: T["update"], resource: T["resource"]) => Promise<T["resource"]>,
  read: () => Promise<T["resource"]>
};

export type CRUDDynamo<T extends CRUDType> = {
  value: T["resource"]
};
export type CRUDRest<T extends CRUDType> = {
  get: network.HTTPTransactionDefinition<{
    request: never,
    response: T["resource"],
    query: T["filter"]
  }>,
  post: network.HTTPTransactionDefinition<{
    request: T["create"],
    response: T["resource"],
    query: Record<string, never>,
  }>,
  put: network.HTTPTransactionDefinition<{
    request: T["update"],
    response: T["resource"],
    query: T["id"],
  }>,
  delete: network.HTTPTransactionDefinition<{
    request: never,
    response: T["resource"],
    query: T["id"]
  }>,
}
export type CRUDService<T extends CRUDType> = {
  create(create: T["create"]):                    Promise<T["resource"]>,
  list  (filter: T["filter"]):                    Promise<T["resource"][]>,
  read  (identify: T["id"]):                      Promise<T["resource"]>,
  update(identify: T["id"], update: T["update"]): Promise<T["resource"]>,
  delete(identify: T["id"]):                      Promise<T["resource"]>,
}

export const createCRUDHTTPTransactionDefinitions = <T extends CRUDType>(
  crud: CRUDDefinition<T>,
  path: string,
): CRUDRest<T> => {
  return {
    get: {
      method: 'GET',
      name: `Find ${crud.name}`,
      path,
      query: crud.filter,
      request: m.never,
      response: crud.resource
    },
    post: {
      method: 'POST',
      name: `Create New ${crud.name}`,
      path,
      query: m.object({}),
      request: crud.create,
      response: crud.resource
    },
    put: {
      method: 'PUT',
      name: `Update ${crud.name}`,
      path,
      query: crud.id,
      request: crud.update,
      response: crud.resource
    },
    delete: {
      method: 'DELETE',
      name: `Delete ${crud.name}`,
      path,
      query: crud.id,
      request: m.never,
      response: crud.resource
    }
  }
}