import { DocSheet, markdownToSheet } from "../../ComponentDoc/mod.ts";
import { http, readByteStream, } from "./mod.ts";
import { MemoryInternet, MemoryInternetComponent, MemoryInternetComponents, NetworkService, createMemoryInternet, createMemoryNetworkService } from "./service.ts";

// @deno-types="vite-text"
import readme from './readme.md?raw';
import { act } from "../../AtlasRenderer/mod.ts";
import { BigTable } from "../../BigTable/mod.ts";
import { janitor } from "./deps.ts";
import { createRouter } from "./router.ts";
import { createJSONRoute } from "./resource/json.ts";
import { randomElement } from "../../RandomThingGenerator/mod.ts";
import { HTTPRoute } from "./route.ts";
import { LabeledTextInput } from "../../Formula/mod.ts";
import { HTTPMethod, HTTPResponse } from "./http/common.ts";
const { h, createContext, useContext, useState, useEffect } = act;

const demoContext = createContext(createMemoryInternet());

const InternetDemo: act.Component = () => {
  const int = useContext(demoContext);
  const [components, setComponents] = useState<MemoryInternetComponent[]>([]);
  useEffect(() => {
    const sub = int.onUpdate.subscribe(int => setComponents([...int.components]));
    setComponents([...int.components]);
    return () => sub.unsubscribe();
  }, []);

  const httpServers = components
    .filter((c): c is MemoryInternetComponents["HTTPServer"] => c.type === 'http')
  const wsServers = components
    .filter((c): c is MemoryInternetComponents["WSServer"] => c.type === 'ws')

  return [
    !!httpServers.length && h(BigTable, { heading: 'HTTPServers', columns: [
      'host', 'port'
    ], rows: httpServers.map(s => [s.host, s.port.toString()]) }),
    !!wsServers.length && h(BigTable, { heading: 'WebSocketServers', columns: [
      'host', 'port'
    ], rows: wsServers.map(s => [s.host, s.port.toString()]) }),
  ];
};

const createGreetingServer = async (net: NetworkService, port = 80) => {
  const server = await net.createHTTPServer(port);
  const helloRoute = createJSONRoute({
    path: '/greeting',
    method: 'GET',
    pretty: true,
    noRequestBody: true,
    handler() {
      const greeting = randomElement([
        'Hi!',
        'Howdy!',
        'What\'s up?',
        'Hello!',
        'Greetings!',
        'Hey!',
        'Yo!',
      ])
      return {
        status: 200,
        headers: {},
        body: { greeting }
      };
    }
  })
  const router = createRouter([helloRoute]);
  const subscription = server.connection.subscribe(router.handleHTTP)
  const close = () => {
    subscription.unsubscribe();
    server.close();
  }
  return { close };
};
const createEchoServer = async (net: NetworkService, port = 80) => {
  const server = await net.createHTTPServer(port);
  const subscription = server.connection.subscribe(c => {
    c.respond({
      status: 200,
      headers: c.request.headers,
      body: c.request.body,
    })
  })
  const close = () => {
    subscription.unsubscribe();
    server.close();
  }
  return { close };
}

const ServerDemo: act.Component = () => {
  const internet = useContext(demoContext);
  const [host, setHost] = useState('www.example.com');
  const [port, setPort] = useState(80);
  const [type, setType] = useState<'greeting' | 'echo'>('greeting');

  type Server = { host: string, port: number, close: () => void }

  const [servers, setServers] = useState<Server[]>([])

  const submitServer = async (e: SubmitEvent) => {
    e.preventDefault();
    const createServer = (host: string, port: number, type: 'greeting' | 'echo') => {
      const net = createMemoryNetworkService(internet, host);

      switch (type) {
        case 'echo':
          return createEchoServer(net, port);
        case 'greeting':
          return createGreetingServer(net, port);
      }
    }
    const server = await createServer(host, port, type);
    setServers(s => [
      ...s,
      { host, port, close: server.close },
    ])
  };

  const onServerCloseClick = (server: Server) => () => {
    server.close()
    setServers(ss => ss.filter(s => s !== server));
  }

  return [
    h('form', { onSubmit: submitServer }, [
      h(LabeledTextInput, {
        label: 'Host',
        value: host,
        onInput: setHost }),
      h(LabeledTextInput, {
        label: 'Port',
        value: port.toString(),
        onInput: p => setPort(Number.parseInt(p)) }),
      h('select', { onInput: (e: InputEvent) => {
          const { value } = (e.target as HTMLSelectElement);
          switch (value) {
            case 'greeting':
            case 'echo':
              setType(value);
          }
        }
      }, [
        h('option', { selected: type === 'greeting' }, 'greeting'),
        h('option', { selected: type === 'echo' }, 'echo'),
      ]),
      h('button', { type: 'submit' }, 'Create Server'),
    ]),
    h('ol', {}, servers.map(s => {
      return h('li', {}, [
        h('pre', { style: { display: 'inline' } }, `http://${s.host}:${s.port}`),
        ' ',
        h('button', { onClick: onServerCloseClick(s) }, 'Close')
      ])
    }))
  ];
};

const ClientDemo = () => {
  const internet = useContext(demoContext);
  const [client] = useState(() => {
    const network = createMemoryNetworkService(internet);
    return network.createHTTPClient();
  })
  const [response, setResponse] = useState<HTTPResponse | null>(null)
  const [responseBody, setResponseBody] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [url, setURL] = useState('http://www.example.com/greeting');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('custom=header,content-type=text/plain');

  const submitRequest = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      setResponseBody('<loading>');
      setResponse(null);
      const response = await client.request({
        url: new URL(url),
        method: method as HTTPMethod,
        headers: Object.fromEntries(headers.split(',').map(h => h.split('='))),
        body: requestBody
          && new Blob([new TextEncoder().encode(requestBody)]).stream()
          || null,
      });
      setResponse(response);
      if (response.body) {
        const bytes = await readByteStream(response.body);
        switch (response.headers["content-type"]) {
          case 'application/json':
          case 'text/plain':
            setResponseBody(new TextDecoder().decode(bytes));
            break;
          default:
            setResponseBody('<unknown content type>');
        }
      } else {
        setResponseBody('<No response body>');
      }
      setErrorMessage('')
    } catch (error) {
      setResponse(null);
      setResponseBody('');
      setErrorMessage(error.message);
    }
  }

  return [
    errorMessage && h('pre', {
      style: {
        backgroundColor: '#c14557', color: 'white', padding: '8px',
        borderRadius: '4px'
      }
    }, errorMessage),
    h('form', { onSubmit: submitRequest }, [
      h(LabeledTextInput, {
        label: 'URL',
        value: url,
        onInput: setURL }),
      h(LabeledTextInput, {
        label: 'Headers',
        value: headers,
        onInput: setHeaders }),
      h(LabeledTextInput, {
        label: 'Method',
        value: method,
        onInput: setMethod }),
      h('textarea', { value: requestBody, onInput: (e: InputEvent) => {
        const { value } = (e.target as HTMLTextAreaElement)
        setRequestBody(value);
      }}),
      h('button', { type: 'submit', }, 'Send Request')
    ]),
    response && h('pre', {
      style: {
        backgroundColor: 'green', color: 'white', padding: '8px',
        borderRadius: '4px'
      }
    }, [
      JSON.stringify({
        status: response.status,
        headers: response.headers,
      }, null, 2)
    ]),
    responseBody && h('pre', {
      style: {
        backgroundColor: '#7745ff', color: 'white', padding: '8px',
        borderRadius: '4px'
      }
    }, responseBody),
  ];
}

export const networkCommonDocs: DocSheet[] = [
  markdownToSheet('NetworkCommon', readme, {
    internetDemo: InternetDemo,
    serverDemo: ServerDemo,
    clientDemo: ClientDemo,
  })
];