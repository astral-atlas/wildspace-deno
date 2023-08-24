import { m } from "../deps.ts";
import { JSONValue, QueryValue } from "./JSONTransaction.ts";

export type JSONResourceType = {
  resource: JSONValue,
  post:     JSONValue,
  filter:   QueryValue,
  id:       QueryValue,
};

export type JSONResourceDefinition<T extends JSONResourceType> = {
  resource: m.ModelOf<T["resource"]>,
  post:     m.ModelOf<T["post"]>,
  filter:   m.ModelOf<T["filter"]>,
  id:       m.ModelOf<T["id"]>,
};

export type JSONResourceClient<T extends JSONResourceType> = {
  get:    (id: T["id"])             => Promise<T["resource"]>,
  list:   (query: T["filter"])      => Promise<T["resource"][]>,
  post:   (submission: T["post"])   => Promise<T["resource"]>,
  delete: (id: T["id"])             => Promise<T["resource"]>,
  put:    (resource: T["resource"]) => Promise<void>,
}

export const createJSONResourceClient = <T extends JSONResourceType>(
  definition: JSONResourceDefinition<T>
) => {

};
