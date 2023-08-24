import { m } from "../deps.ts";
import { HTTPClient } from "./client.ts";
import { HTTPMethod, HTTPResponse } from "./common.ts";

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: JSONValue }
  | ReadonlyArray<JSONValue>

export type QueryValue = { readonly [key: string]: string };

export type JSONTransactionType = {
  request: JSONValue;
  response: JSONValue;
  query: QueryValue;
};

export type JSONTransactionDefinition<T extends JSONTransactionType> = {
  path: string;
  name: string;
  method: HTTPMethod;
  request: m.ModelOf<T["request"]>;
  response: m.ModelOf<T["response"]>;
  query: m.ModelOf<T["query"]>;
};

export type JSONTransactionServiceDefinition = {
  baseURL: URL;
  authorization?: { type: "none" } | { type: "bearer"; token: string };
};

export type JSONTransactionImplementation = {
  http: HTTPClient;
  encodeString: (valueToEncode: string) => Promise<Uint8Array>;
  decodeString: (valueToDecode: Uint8Array) => Promise<string>;
};

export type JSONTransactionClient<T extends JSONTransactionType> = {
  start: (options: {
    query?: T["query"];
    request?: T["request"];
  }) => Promise<[T["response"], HTTPResponse]>;
};

const createAuthorizationPair = (
  auth: JSONTransactionServiceDefinition["authorization"] = { type: "none" }
) => {
  switch (auth.type) {
    case "none":
    default:
      return null;
    case "bearer":
      return [`Authorization`, `Bearer ${auth.token}`];
  }
};

export const createJSONTransactionClient = <T extends JSONTransactionType>(
  { http, encodeString, decodeString }: JSONTransactionImplementation,
  { path, method, response }: JSONTransactionDefinition<T>,
  service: JSONTransactionServiceDefinition
): JSONTransactionClient<T> => {
  const castResponse = m.createModelCaster(response);
  const pair = createAuthorizationPair(service.authorization);

  return {
    async start({ query, request = null }) {
      const url = new URL(service.baseURL);
      url.pathname += path;
      url.search = new URLSearchParams(query).toString();

      const body = request && (await encodeString(JSON.stringify(request)));

      const headerPairs = [pair].filter((e): e is [string, string] => !!e);
      const headers = Object.fromEntries(headerPairs);

      const response = await http.start({ method, url, body, headers });
      const responseString =
        response.body &&
        castResponse(JSON.parse(await decodeString(response.body)));

      return [responseString, response];
    },
  };
};
