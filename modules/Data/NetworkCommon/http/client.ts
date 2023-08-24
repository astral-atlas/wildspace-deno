import { HTTPRequest, HTTPResponse } from "./common.ts";


export type HTTPClient = {
  start: (request: HTTPRequest) => Promise<HTTPResponse>;
};

export const createFetchHTTPClient = (
  fetch: typeof window.fetch
): HTTPClient => {
  return {
    async start({ url, headers, method, body }) {
      const response = await fetch(url, { headers, method, body });
      const responseBody =
        response.body && new Uint8Array(await response.arrayBuffer());
      return {
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        body: responseBody,
      };
    },
  };
};
