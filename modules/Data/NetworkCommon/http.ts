import { m } from "./deps.ts";
import { JSONValue } from "./rest.ts";

export type HTTPTransactionType = {
  request: JSONValue,
  response: JSONValue,
  query: { readonly [name: string]: string }
}

export type HTTPMethod =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'DELETE'
  | 'HEAD'

export type HTTPTransactionDefinition<T extends HTTPTransactionType> = {
  path: string,
  name: string,
  method:   HTTPMethod,
  request:  m.ModelOf<T["request"]>,
  response: m.ModelOf<T["response"]>,
  query:    m.ModelOf<T["query"]>,
};

export type HTTPTransactionClient<T extends HTTPTransactionType> = {
  transaction: (options: {
    query?: T["query"],
    request?: T["request"]
  }) => Promise<T["response"]>,
};

export const createHTTPTransactionClient = <T extends HTTPTransactionType>(
  definition: HTTPTransactionDefinition<T>,
): HTTPTransactionClient<T> => {
  return {
    async transaction({ query, request }) {
      throw new Error();
    }
  }
}

export const createHTTPClient = () => {

}