# Network Common

## NetworkService

The network service object allows it's user to interface
with a network (typically the regular internet, see [internet](#internet)
for more details).

```ts
export type NetworkService = {
  createHTTPServer: (port?: number) => Promise<Meta["HTTPServer"]>,
  createWSServer: (port?: number) => Promise<Meta["WSServer"]>,

  createHTTPClient: () => Meta["HTTPClient"],
  createWSClient: () => Meta["WSClient"],
};
```

### `createBrowserNetworkService()`

Passing in some web browser objects (like the `fetch` object),
return a network service object.

> Note, `createHTTPServer` and `createWSServer` functions will
> throw errors, as they are not supported in this platform.

### `createDenoNetworkService()`

Using the builtin `Deno` object.

### `createNodeNetworkService()`

Using some node-specific API's that are passed in as arguments.

## HTTP

Common definitions for useful tasks in HTTP land.

### HTTPTransaction

### WSConnection

## Router

A "router" is an object that can recieve network connections
like HTTP & WebSocket connections
and provide a response based on the "routes"
that were passed into it.

It's signiture 

### HTTPRoute
### WSRoute

## Internet

Network common also includes a suite of objects
that provide a crude simulation of a network - via
the "memory internet" service.

An **internet** is an object that contains a set of components:
  - HTTPServer
  - WSServer
  - TLSProxy

You can run queries against these objects to find servers
for a given URL, crudely emulating how a
real network request might look.

The `createMemoryNetworkService()` function needs a (fake) internet
to connect to, which will 

> Note that using URL that refers to locations inside the fake internet
> will not work with any native DOM APIs as they will make real network
> requests. Try using the [createObjectURL API](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) if you need to interface
> with native APIs.

### Internet Control Panel

Here is a list of all current internet components.

::internetDemo

### Servers

Create some servers, give them ports and hostname. The
types of servers are:
  - **greeting server**. Returns a JSON greeting on `/greeting`,
  and a 404 on all other paths.
  - **echo server**. Returns the headers and body passed to it.

::serverDemo

### Client

::clientDemo


```






# Random buffer
```