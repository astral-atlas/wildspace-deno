import { HTTPRequest, HTTPResponse } from "./http/mod.ts";
import { HTTPRoute, Route } from "./route.ts";
import { HTTPServerConnection, WebSocketServerConnection } from "./service.ts";

export type Router = {
  handleHTTP: (transaction: HTTPServerConnection) => void;
  handleWebSocket: (connection: WebSocketServerConnection) => void;
};

export type RouterOptions = {
  httpErrorHandler?: (
    error: unknown,
    request: HTTPRequest
  ) => Promise<HTTPResponse>;
  noRouteHandler?: (request: HTTPRequest) => Promise<HTTPResponse>;
};

export const isRequestMatchingRoute = (
  request: HTTPRequest,
  route: HTTPRoute
) => {
  const routePath = route.path.startsWith('/') ? route.path.toLocaleLowerCase() : '/' + route.path.toLocaleLowerCase();
  const methodEqual = request.method === route.method;
  const pathEqual =
    request.url.pathname.toLocaleLowerCase() === routePath;
  return methodEqual && pathEqual;
};

export const createRouter = (
  routes: Route[],
  options: RouterOptions = {}
): Router => {
  const httpRoutes = routes.filter((r): r is HTTPRoute => r.type === "http");

  const defaultNoRouteHandler = (request: HTTPRequest): HTTPResponse => {
    return {
      status: 404,
      headers: { "content-type": "text/plain" },
      body: new Blob([
        new TextEncoder().encode(
          `Method ${request.method} & Route ${request.url.pathname} could not be found`
        ),
      ]).stream(),
    };
  };
  const defaultErrorHandler = (error: unknown, request: HTTPRequest): HTTPResponse => {
    console.error(error);
    console.info(request);
    return {
      status: 500,
      headers: { "content-type": "text/plain" },
      body: new Blob([
        new TextEncoder().encode(
          `The server has encountered an unexpected error`
        ),
      ]).stream(),
    };
  }

  return {
    handleHTTP(transaction) {
      const route = httpRoutes.find((r) =>
        isRequestMatchingRoute(transaction.request, r)
      );
      const handler = (route?.handler || options.noRouteHandler || defaultNoRouteHandler);
      const errorHandler = (options.httpErrorHandler || defaultErrorHandler)

      Promise.resolve(handler(transaction.request))
        .catch(error => errorHandler(error, transaction.request))
        .then((response) => transaction.respond(response))
    },
    handleWebSocket(_) {
      throw new Error("Websocket Unimplemented");
    },
  };
};
