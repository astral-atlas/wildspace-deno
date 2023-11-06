import { m } from "./deps.ts";
import { DomainClient } from "./domain.ts";
import { HTTPMethod } from "./http/common.ts";
import { HTTPStatus } from "./http/mod.ts";
import { HTTPHeaders } from "./http/mod.ts";
import { createJSONRoute, readByteStream } from "./resource/mod.ts";
import { Route } from "./route.ts";

export type TransactionType = {
  request: m.ModeledType,
  response: m.ModeledType,
  query: null | Record<string, string>,
};

export type TransactionDefinition<T extends TransactionType> = {
  path: string,
  method: HTTPMethod
  models: {
    request: m.ModelOf2<T["request"]>,
    response: m.ModelOf2<T["response"]>,
    query: m.ModelOf2<T["query"]>,
  }
};

export type OfTransactionType<T extends TransactionDefinition<TransactionType>> = {
  request: m.OfModelType<T["models"]["request"]>,
  response: m.OfModelType<T["models"]["response"]>,
  query: m.OfModelType<T["models"]["query"]>,
}

type OptionalPromise<T> = Promise<T> | T;
type TransactionRouteRequest<T extends TransactionType> = {
  request: T["request"],
  query: T["query"],
  headers: HTTPHeaders,
}
type TransactionRouteResponse<T extends TransactionType> = {
  body: T["response"],
  headers?: HTTPHeaders | null,
  status: HTTPStatus
}
export type TransactionRouteImplementation<T extends TransactionType> = (
  request: TransactionRouteRequest<T>
) => OptionalPromise<TransactionRouteResponse<T>>;

export const createTransactionHTTPRoute = <T extends TransactionType>(
  definition: TransactionDefinition<T>,
  implementation: TransactionRouteImplementation<T>,
): Route => {
  const castRequest = m.createModelCaster(definition.models.request);
  const castQuery = m.createModelCaster(definition.models.query);
  
  return createJSONRoute({
    path: definition.path,
    method: definition.method,
    async handler(request) {
      const requestValue = castRequest(request.body);
      const queryValue = castQuery(Object.fromEntries(request.url.searchParams)) as T["query"];
      const response = await implementation({
        request: requestValue,
        query: queryValue,
        headers: request.headers,
      });
      return {
        status: response.status,
        body: response.body,
        headers: response.headers || {},
      };
    },
  });
};

type TransactionClientResponse<T extends TransactionType> = {
  body: T["response"],
  headers: HTTPHeaders,
  status: HTTPStatus
}
type TransactionClientRequest<T extends TransactionType> = {
  request: T["request"],
  query: T["query"],
  headers?: HTTPHeaders | null,
}
export type TransactionClient<T extends TransactionType> = (
  request: TransactionClientRequest<T>
) => Promise<TransactionClientResponse<T>>;

export const createTransactionHTTPClient = <T extends TransactionType>(
  definition: TransactionDefinition<T>,
  domain: DomainClient,
): TransactionClient<T> => {
  const castRepsonse = m.createModelCaster(definition.models.response) as m.Cast<T["response"]>;

  const streamBody = (value: unknown) => {
    return new Blob([new TextEncoder().encode(JSON.stringify(value))]).stream()
  }
  const decodeResponse = async (stream: ReadableStream | null) => {
    if (!stream)
      return null;
    const bytes = await readByteStream(stream);
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }

  return async ({ query, request, headers }) => {
    const httpResponse = await domain.request({
      path: definition.path,
      method: definition.method,
      query: query || {},
      headers: headers || {},
      body: streamBody(request),
    })
    const responseBody = castRepsonse(await decodeResponse(httpResponse.body));
    return {
      status: httpResponse.status,
      headers: httpResponse.headers,
      body: responseBody,
    }
  };
};