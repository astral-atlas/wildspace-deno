import { channel } from "../../ServiceCommon/deps.ts";
import { Meta } from "../service.ts";
import { WSRequest } from "../ws/mod.ts";
import { HTTPMethod, HTTPRequest, HTTPResponse } from "./common.ts";

export type Route =
  | HTTPRoute
  | WebsocketRoute

export type HTTPRoute = {
  type: 'http',
  path: string,
  method: HTTPMethod,
  handler: (request: HTTPRequest) => (Promise<HTTPResponse> | HTTPResponse),
};

export type WebsocketRoute = {
  type: 'websocket',
  path: string,
  handler: (channel: channel.UniformChannel<Uint8Array>) => void,
}

export type RouterType = {
  nativeHTTPRequest: unknown,
  nativeWSConnection: unknown,
};

export type Router<T extends RouterType> = {
  handle: (request: T["nativeHTTPRequest"]) => void,
};
export type RouterImplementation<T extends RouterType> = {
  recieve: (nativeRequest: T["nativeHTTPRequest"]) => {
    commonRequest: HTTPRequest,
    handleResponse: (response: HTTPResponse) => void,
  },
  connect: (nativeRequest: T["nativeWSConnection"]) => {
    commonRequest: WSRequest,
    channel: channel.UniformChannel<Uint8Array>,
  }
};

export const findTargetRoute = (request: HTTPRequest, routes: Route[]) => {
  return routes.find(route => {
    if (route.type === 'http') {
      const methodEqual = request.method === route.method;
      const pathEqual = request.url.pathname.toLocaleLowerCase() === route.path.toLocaleLowerCase();
      return methodEqual || pathEqual
    }
    if (route.type === 'websocket') {
      const pathEqual = request.url.pathname.toLocaleLowerCase() === route.path.toLocaleLowerCase();
      return pathEqual;
    }
  })
};

export const createRouter = <T extends RouterType>(
  implementation: RouterImplementation<T>,
  routes: HTTPRoute[],
) => {
  const handle = (request: T["nativeHTTPRequest"]) => {
    const { commonRequest, handleResponse } = implementation.recieve(request);
    const route = findTargetRoute(commonRequest, routes);
  };
  return { handle };
}

export const createMemoryServer = async (
  network: InternetService,
  host: string,
  routes: HTTPRoute[]
) => {
  type MemoryRouterType = {
    nativeHTTPRequest: Meta["HTTPConnection"],
    nativeWSConnection: Meta["WSConnection"]
  }
  const router = createRouter<MemoryRouterType>({
    recieve(transaction) {
      const commonRequest = transaction.request;
      const handleResponse = transaction.respond;
      return { commonRequest, handleResponse }
    },
    connect(connection) {
      return {
        commonRequest: { path: connection.path },
        channel: connection.channel,
      }
    }
  }, routes);
  const server = await network.createHTTPServer(host);
  const wsserver = await network.createWSServer(host);
  const subscription = server.connection.subscribe((transaction) => {
    router.handle(transaction);
  });
  const wsSubscription = wsserver.connection.subscribe(() => {

  });
  const close = () => {
    server.close();
    subscription.unsubscribe();
  }
  return { close };
};
