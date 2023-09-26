import { act } from '../AtlasRenderer/mod.ts';
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import * as janitor from '../Janitor/mod.ts';
import { createMemoryBlobStreamService } from "./blob/mod.ts";
import { network } from "./deps.ts";
import { createRoutes } from "./routes.ts";
// @deno-types="vite-text"
import readme from './readme.md?raw';
import { createLocalURLService } from "./service.ts";
import { LabeledTextInput } from "../Formula/mod.ts";

const { createContext, h, useContext, useEffect, useState, useRef } = act;

const internetContext = createContext(network.createMemoryInternet());

export const ArtifactDemo = () => {
  const internet = useContext(internetContext)
  const net = useRef(network.createMemoryNetworkService(internet, 'artifact', { delay: 1000 })).current;

  useEffect(() => {
    const clean = janitor.createCleanupTask();
    const run = async () => {
      const server = await net.createHTTPServer();
      const blob = createMemoryBlobStreamService();
      const router = network.createRouter([
        ...createRoutes(blob)
      ])
      const subscription = server.connection.subscribe(router.handleHTTP);
      clean.register(() => {
        server.close();
        subscription.unsubscribe();
      })
    }
    run();
    return () => {
      clean.run();
    }
  }, []);

  const service = useRef(createLocalURLService('http://artifact')).current;

  const [imageURL, setImageURL] = useState<URL | null>(null);
  const [assetId, setAssetId] = useState('DefaultID');
  const [state, setState] = useState('idle');

  const onUpload = () => {
    const el = document.createElement('input');
    el.type = "file";
    el.accept = "image/*";
    el.click();
    const onInput = async (_: Event) => {
      el.removeEventListener('input', onInput)
      const file = el.files && el.files[0];
      if (!file)
        throw new Error();
      
      const url = await service.createUploadURL(assetId)
      const client = net.createHTTPClient();
      const stream = file.stream()
      setState('Uploading');
      await client.request({
        url,
        method: 'PUT',
        headers: {},
        body: stream,
      })
      setState('Upload Complete');
    }
    el.addEventListener('input', onInput)
  }
  const onDownload = async () => {
    const url = await service.createDownloadURL(assetId)
    const client = net.createHTTPClient();
    setState('Download Starting')
    const response = await client.request({
      url,
      method: 'GET',
      headers: {},
      body: null
    });
    if (!response.body)
      throw new Error();
    const blob = new Blob([await network.readByteStream(response.body)]);
    setState('Download Complete')
    if (imageURL) {
      URL.revokeObjectURL(imageURL.href)
    }
    const blobURL = URL.createObjectURL(blob)
    setImageURL(new URL(blobURL));
  }

  return [
    h('pre', {}, state),
    h(LabeledTextInput, { label: 'AssetID', value: assetId, onInput: setAssetId }),
    h('button', { onClick: onUpload }, 'Upload Image'),
    h('button', { onClick: onDownload }, 'Download Image'),
    imageURL && h('img', { src: imageURL.href, style: { width: '100%' } }),
  ];
};

export const artifactDocs: DocSheet[] = [
  markdownToSheet('Artifact', readme, {
    artifactDemo: ArtifactDemo,
  }),
];