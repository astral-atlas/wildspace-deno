import { channel } from "../ServiceCommon/deps.ts";
import { HTTPMethod, HTTPRequest, HTTPResponse } from "./http/mod.ts";

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
