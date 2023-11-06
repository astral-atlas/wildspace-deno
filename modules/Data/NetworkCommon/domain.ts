import { HTTPHeaders, HTTPMethod, HTTPRequest, HTTPResponse } from "./http/common.ts";
import { HTTPClient } from "./service.ts";

export type HTTPDomainRequest = {
  path: string,
  query: Record<string, string> | null,
  headers: HTTPHeaders | null,
  method: HTTPMethod,
  body: null | ReadableStream<Uint8Array>;
};
export type DomainAuthorization =
  | { type: 'bearer', token: string }
  | { type: 'none' }

export type DomainClient = {
  domain: URL,
  authorization: DomainAuthorization,
  http: HTTPClient,
  request: (request: HTTPDomainRequest) => Promise<HTTPResponse>
};

const createAuthorizationHeaders = (authorization: DomainAuthorization): HTTPHeaders => {
  switch (authorization.type) {
    case 'bearer':
      return { 'Authorisation': `Bearer ${authorization.token}` };
    case 'none':
      return {};
    default:
      throw new Error();
  }
}

export const createDomainClient = (
  domain: URL,
  authorization: DomainAuthorization,
  http: HTTPClient
): DomainClient => {
  const authorizationHeaders = createAuthorizationHeaders(authorization);
  return {
    domain,
    authorization,
    http,
    request(request) {
      const url = new URL(request.path, domain);
      if (request.query)
        url.search = new URLSearchParams(request.query).toString();
      const headers = {
        ...authorizationHeaders,
        ...request.headers || {},
      };
      return http.request({
        ...request,
        url,
        headers,
      })
    }
  }
};
