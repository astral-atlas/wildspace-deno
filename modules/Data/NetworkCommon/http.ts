import { m } from "./deps.ts";
import { JSONValue } from "./http/JSONTransaction.ts";
import { HTTPMethod } from "./http/mod.ts";

export type HTTPTransactionType = {
  request: JSONValue,
  response: JSONValue,
  query: { readonly [name: string]: string }
}

export type HTTPTransactionDefinition<T extends HTTPTransactionType> = {
  path: string,
  name: string,
  method:   HTTPMethod,
  request:  m.ModelOf<T["request"]>,
  response: m.ModelOf<T["response"]>,
  query:    m.ModelOf<T["query"]>,
};

export type HTTPTransactionClient<T extends HTTPTransactionType> = {
  start: (options: {
    query?: T["query"],
    request?: T["request"]
  }) => Promise<T["response"]>,
};