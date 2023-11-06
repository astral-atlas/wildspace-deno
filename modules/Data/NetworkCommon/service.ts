import { channel, rxjs } from "./deps.ts";
import { HTTPRequest, HTTPResponse } from "./http/common.ts";
import { WSRequest } from "./ws/mod.ts";

export type HTTPServerConnection = {
  request: HTTPRequest,
  respond: (response: HTTPResponse) => void,
};
export type WebSocketServerConnection = {
  path: string,
  channel: channel.UniformChannel<Uint8Array>,
};

export type HTTPClient = {
  request:(request: HTTPRequest) => Promise<HTTPResponse>
};

export type WSClient = {
  request:(request: WSRequest) => Promise<WebSocketServerConnection>
};

export type Meta = {
  HTTPServer: { connection: rxjs.Observable<HTTPServerConnection>, close: () => void },
  WSServer: { connection: rxjs.Observable<WebSocketServerConnection>, close: () => void },

  HTTPClient: HTTPClient;
  WSClient: WSClient;
};

/**
 * Functions that an
 */
export type NetworkService = {
  createHTTPServer: (port?: number) => Promise<Meta["HTTPServer"]>,
  createWSServer: (port?: number) => Promise<Meta["WSServer"]>,

  createHTTPClient: () => Meta["HTTPClient"],
  createWSClient: () => Meta["WSClient"],
};

export type MemoryInternetComponents = {
  "HTTPServer": {
    type: 'http',
    host: string,
    port: number,
    connection: rxjs.Subject<HTTPServerConnection>
  },
  "WSServer": {
    type: 'ws',
    host: string,
    port: number ,
    connection: rxjs.Subject<WebSocketServerConnection>
  },
  "TLSProxy": {
    type: 'tls',
    host: string,
    proxyingHost: string,
  },
}
export type MemoryInternetComponent =
  MemoryInternetComponents["HTTPServer" | "WSServer" | "TLSProxy"]

export type MemoryInternet = {
  components: MemoryInternetComponent[],
  onUpdate: rxjs.Observable<MemoryInternet>,

  addInternetComponent(component: MemoryInternetComponent): void,
  removeInternetComponent(component: MemoryInternetComponent): void,

  findHTTPServer: (host: string, port: number) => null | MemoryInternetComponents["HTTPServer"],
  findWSServer: (host: string, port: number) => null | MemoryInternetComponents["WSServer"],
};

/**
 * This function creates a fake network that you can attach
 * servers to - use `createMemoryNetworkService()` to create a
 * "hosts" or "clients" on the network, who can talk to each other
 * via this shared object.
 */
export const createMemoryInternet = (): MemoryInternet => {
  const components: MemoryInternetComponent[] = [];
  const onUpdate = new rxjs.Subject<MemoryInternet>()
  const addInternetComponent = (component: MemoryInternetComponent) => {
    internet.components.push(component);
    onUpdate.next(internet);
  };
  const removeInternetComponent = (component: MemoryInternetComponent) => {
    internet.components = internet.components.filter(c => c !== component);
    onUpdate.next(internet);
  };
  const addressIsEqual = (address: { port: number, host: string }, host: string, port: number) => {
    return address.host === host && address.port === port;
  }
  const findHTTPServer = (host: string, port: number) => {
    return internet.components
      .filter((c): c is MemoryInternetComponents["HTTPServer"] => c.type === 'http')
      .find(s => addressIsEqual(s, host, port)) || null;
  }
  const findWSServer = (host: string, port: number) => {
    return internet.components
      .filter((c): c is MemoryInternetComponents["WSServer"] => c.type === 'ws')
      .find(s => addressIsEqual(s, host, port)) || null;
  }
  const internet =  {
    components,
    onUpdate,

    addInternetComponent,
    removeInternetComponent,

    findHTTPServer,
    findWSServer,
  }
  return internet;
}

type InternetOptions = {
  delay?: number,
}

export const createMemoryNetworkService = (
  internet: MemoryInternet,
  host?: string | null,
  options: InternetOptions = {}
): NetworkService => {
  return {
    createHTTPServer(port = 80) {
      if (!host)
        throw new Error('Network service has no hostname, cant run a server');

      const connection = new rxjs.Subject<HTTPServerConnection>();
      const server = { type: 'http', host, port, connection } as const;
      internet.addInternetComponent(server);
      const close = () => {
        internet.removeInternetComponent(server);
        connection.complete();
      }
      return Promise.resolve({ close, connection });
    },
    createWSServer(_) {
      throw new Error('Unsupported')
    },

    createHTTPClient() {
      return { 
        request(request) {
          const host = request.url.hostname;
          const port = Number.parseInt(request.url.port) || 80;
          const server = internet.findHTTPServer(host, port)
          if (request.url.protocol !== 'http:' && request.url.protocol !== 'https:')
            throw new Error(`Non HTTP protocol used for HTTP request (${request.url.protocol})`)
          if (!server)
            throw new Error(`Cant find HTTP connection on ${host}:${port}`);
          const promise = new Promise<HTTPResponse>((resolve) => {
            setTimeout(() => {
              const transaction: HTTPServerConnection = {
                request,
                respond(response) {
                  if (!response.body)
                    return resolve(response);

                  const stream = new DelayStream(options.delay || 0);
                  response.body.pipeTo(stream.writable, { preventClose: true })
                    .then(() => stream.finish())
                  
                  const delayedResponse = {
                    ...response,
                    body: stream.readable
                  }
                  resolve(delayedResponse);
                }
              }
              server.connection.next(transaction)
            }, options.delay || 0)
          });
          return promise;
        }
      };
    },
    createWSClient() {
      throw new Error('Unsupported')
    },
  }
}

class DelayStream extends TransformStream {
  ids = new Set<number>();
  onWrite = new rxjs.Subject()

  finish() {
    this.onWrite.subscribe(() =>{
      if (this.ids.size === 0) {
        this.writable.close();
      }
    })
  }
  
  constructor(delay: number) {
    super({ 
      start() {},
      transform(chunk, controller) {
        const id = setTimeout(() => {
          controller.enqueue(chunk);
          ids.delete(id);
          onWrite.next(null);
        }, delay)
        ids.add(id);
      },
      flush() {
        for (const id of ids)
          clearTimeout(id);
      },
    }, new ByteLengthQueuingStrategy({ highWaterMark: 256 }));
    const ids = this.ids;
    const onWrite = this.onWrite;
  }
}
