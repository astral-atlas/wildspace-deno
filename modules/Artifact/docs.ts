import { act } from "../AtlasRenderer/mod.ts";
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { network, simpleSystem } from "./deps.ts";
import { createRoutes } from "./routes.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { LabeledTextInput } from "../Formula/mod.ts";
import { UploadButton } from "./components/UploadButton.ts";
import { StoreVisualzer } from "../Data/DataDoc/mod.ts";
import { createBackend } from './backend.ts';
import { createDocContext } from "../ComponentDoc/DocContext.ts";
import { createRemoteService } from "./service.ts";

const { h, useState } = act;

const { useDocContext, Provider } = createDocContext(async () => {
  const url = new URL('http://server.artifact');
  const world = simpleSystem.createMemoryWorld();
  const backend = createBackend(world);
  const internet = network.createMemoryInternet();
  const netService = network.createMemoryNetworkService(internet, url.hostname, {
    delay: 500
  });

  const routes = createRoutes(backend, url.origin)
  const router = network.createRouter(routes);
  const server = await netService.createHTTPServer(80);
  server.connection.subscribe(router.handleHTTP);

  const http = netService.createHTTPClient();
  const domain = network.createDomainClient(url, { type: 'none' }, http);
  const service = createRemoteService(domain);

  return { service, server, world, backend, netService };
});

export const ArtifactDemo = () => {
  const { service } = useDocContext();

  const [imageURL, setImageURL] = useState<URL | null>(null);
  const [gameId, setGameId] = useState("DefaultGameID");
  const [assetId, setAssetId] = useState("DefaultAssetID");
  const [state, setState] = useState("idle");

  const onDownload = async () => {
    setState("Download Starting");
    const blob = await service.downloadAsset(gameId, assetId)
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
      label: "GameID",
      value: gameId,
      onInput: setGameId,
    }),
    h(LabeledTextInput, {
      label: "AssetID",
      value: assetId,
      onInput: setAssetId,
    }),
    h("button", { onClick: onDownload }, "Download Image"),
    imageURL && h("img", { src: imageURL.href, style: { width: "100%" } }),
  ];
};

const UploadButtonDemo = () => {
  const { service, world } = useDocContext();
  const [gameId, setGameId] = useState("DefaultGameID");

  const assetStore = world.partitions.get('artifact')
  if (!assetStore)
    return 'oops';

  return [
    h(LabeledTextInput, {
      label: "GameID",
      value: gameId,
      onInput: setGameId,
    }),
    h(UploadButton, {
      gameId,
      artifact: service,
      accept: 'image/*',
    }),
    h(StoreVisualzer, {
      store: assetStore,
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
