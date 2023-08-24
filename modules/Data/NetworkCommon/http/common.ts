export type HTTPMethod =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'DELETE'
  | 'HEAD'

export type HTTPStatus = number;

export type HTTPHeaders = Record<string, string>;

export type HTTPRequest = {
  url: URL;
  headers: HTTPHeaders;
  method: HTTPMethod;
  body: null | Uint8Array;
};
export type HTTPResponse = {
  status: HTTPStatus;
  headers: HTTPHeaders;
  body: null | Uint8Array;
};