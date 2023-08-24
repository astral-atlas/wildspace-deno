import { m } from "./deps.ts";
import { JSONValue, QueryValue } from "./http/JSONTransaction.ts";

export type RESTType = {
  resource: JSONValue,
  post:     JSONValue,
  filter:   QueryValue,
  id:       QueryValue,
};

export type RESTResourceDefinition<T extends RESTType> = {
  resource: m.ModelOf<T["resource"]>,
};

export type RESTResource<T extends RESTType> = {
  get:    (id: T["id"])             => Promise<T["resource"]>,
  list:   (query: T["filter"])      => Promise<T["resource"][]>,
  post:   (submission: T["post"])   => Promise<T["resource"]>,
  delete: (id: T["id"])             => Promise<T["resource"]>,
  put:    (resource: T["resource"]) => Promise<void>,
}

export const createRESTResource = <T extends RESTType>(): RESTResource<T> => {
  throw new Error();
};