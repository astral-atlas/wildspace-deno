import { act } from "../AtlasRenderer/mod.ts";
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import * as janitor from "../Janitor/mod.ts";
import { createMemoryBlobStreamService } from "./blob/mod.ts";
import { network } from "./deps.ts";
import { createRoutes } from "./routes.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import {
  createArtifactMemoryBackend,
  createArtifactService,
  createInsecureArtifactImplementation,
  createLocalURLService,
} from "./service.ts";
import { LabeledTextInput } from "../Formula/mod.ts";
import { UploadButton } from "./components/UploadButton.ts";
import { StoreVisualzer } from "../Data/DataDoc/mod.ts";

const { createContext, h, useContext, useEffect, useState, useRef } = act;

const context = createContext<null | ReturnType<typeof useDocContext>>(null);

const useDocContext = () => {
  const internet = useRef(
    network.createMemoryInternet()
  ).current;
  const net = useRef(
    network.createMemoryNetworkService(internet, "artifact", { delay: 1000 })
  ).current;
  const implementation = useRef(
    createInsecureArtifactImplementation()
  ).current;
  const backend = useRef(
    createArtifactMemoryBackend(implementation)
  ).current;
  const artifact = useRef(
    createArtifactService(backend, implementation, "http://artifact")
  ).current;

  useEffect(() => {
    const clean = janitor.createCleanupTask();
    const run = async () => {
      const server = await net.createHTTPServer();
      const blob = createMemoryBlobStreamService(artifact);
      const router = network.createRouter([...createRoutes(blob)]);
      const subscription = server.connection.subscribe(router.handleHTTP);
      clean.register(() => {
        server.close();
        subscription.unsubscribe();
      });
    };
    run();
    return () => {
      clean.run();
    };
  }, []);

  return { artifact, backend, net }
}
const Provider: act.Component = ({ children }) => {
  const value = useDocContext();
  return h(context.Provider, { value }, children);
}

export const ArtifactDemo = () => {
  const c = useContext(context);
  if (!c) 
    return null;
  const { net, artifact } = c;

  const [imageURL, setImageURL] = useState<URL | null>(null);
  const [assetId, setAssetId] = useState("DefaultID");
  const [state, setState] = useState("idle");

  const onDownload = async () => {
    const url = await artifact.url.createDownloadURL(assetId, 'me');
    const client = net.createHTTPClient();
    setState("Download Starting");
    const response = await client.request({
      url,
      method: "GET",
      headers: {},
      body: null,
    });
    if (!response.body) throw new Error();
    const blob = new Blob([await network.readByteStream(response.body)]);
    setState("Download Complete");
    if (imageURL) {
      URL.revokeObjectURL(imageURL.href);
    }
    const blobURL = URL.createObjectURL(blob);
    setImageURL(new URL(blobURL));
  };

  return [
    h("pre", {}, state),
    h(LabeledTextInput, {
      label: "AssetID",
      value: assetId,
      onInput: setAssetId,
    }),
    h("button", { onClick: onDownload }, "Download Image"),
    imageURL && h("img", { src: imageURL.href, style: { width: "100%" } }),
  ];
};

const i = createInsecureArtifactImplementation();

const UploadButtonDemo = () => {
  const c = useContext(context);
  if (!c) 
    return null;
  const { net, artifact, backend } = c;
  const http = useRef(
    net.createHTTPClient()
  ).current;

  return [
    h(UploadButton, {
      http,
      artifact,
      accept: 'image/*',
    }),
    h(StoreVisualzer, {
      store: backend.memory.asset,
      name: 'Assets',
      style: { width: '200%' }
    })
  ];
};

export const artifactDocs: DocSheet[] = [
  markdownToSheet("Artifact", readme, {
    artifactDemo: ArtifactDemo,
    uploadButtonDemo: UploadButtonDemo,
  }, Provider),
];
