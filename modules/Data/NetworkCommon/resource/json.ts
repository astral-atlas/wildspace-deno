import { http } from "./deps.ts";
import { readByteStream } from "./stream.ts";

export type JSONRequest = {
  url: URL,
  method: http.HTTPMethod,
  headers: { [key: string]: string },
  body: http.JSONValue,
};
export type JSONResponse = {
  status: http.HTTPStatus,
  headers: { [key: string]: string },
  body: http.JSONValue,
}

type JSONRouteOptions = {
  method: http.HTTPMethod,
  path: string,
  pretty?: boolean,
  noRequestBody?: boolean,
  handler: (request: JSONRequest) => Promise<JSONResponse> | JSONResponse
};

export const createJSONRoute = (
  options: JSONRouteOptions
): http.HTTPRoute => {
  const httpHandler = async ({ method, url, body, headers }: http.HTTPRequest) => {
    const bodyBytes = !options.noRequestBody && body && await readByteStream(body);
    const bodyValue = !!bodyBytes && (JSON.parse(new TextDecoder().decode(bodyBytes)) as http.JSONValue);
    const response = await options.handler({
      method,
      url,
      headers,
      body: bodyValue,
    })
    const responseBytes = !!response.body && new TextEncoder()
      .encode(JSON.stringify(response.body, null, options.pretty ? 2 : 0))
    if (!responseBytes)
      return {
        status: response.status,
        headers: response.headers,
        body: null,
      }

    return {
      status: response.status,
      headers: {
        ...response.headers,
        'content-type': 'application/json',
        'content-length': responseBytes.byteLength.toString(),
      },
      body: new Blob([responseBytes])
        .stream()
    }
  }
  return {
    type: 'http',
    path: options.path,
    method: options.method,
    handler: httpHandler,
  }
};
