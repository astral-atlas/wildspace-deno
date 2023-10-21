import { BlobService, BlobStreamService, createMemoryBlobStreamService } from "./blob/service.ts";
import { m, nanoid, service, storage } from "./deps.ts";
import { AssetID, assetDefinition, assetUsageDefinition } from "./models.ts";

const assetSystem = {
  names: ['artifact', 'asset'],
  partName: 'ownerId',
  sortName: 'assetId',
  resource: assetDefinition,
  editable: m.object({
    ownerId:        m.nullable(m.string),
    contentType:    m.nullable(m.string),
    contentLength:  m.nullable(m.number),
    state:          m.nullable(assetDefinition.value.properties.state),
    users:          m.nullable(m.array(assetUsageDefinition)),
  }),
} as const;
service.assertIsSystem(assetSystem);

export const systems = {
  asset: assetSystem,
};

type Systems = {
  asset: service.ToCommonSystemType<typeof assetSystem>,
};
type Meta = {
  "Components": {
    asset: service.CommonSystemComponents<Systems["asset"]>,
  }
};

type ArtifactBackend = {
  assets: Pick<Meta["Components"]["asset"], 'channel' | 'storage' | 'changes'>
};
type ArtifactMemoryBackend = ArtifactBackend & {
  memory: {
    asset: storage.DynamoMemoryStore<service.CommonSystemOutputType<Systems["asset"]>["storage"]>
  }
}
type ArtifactImplementation = {
  assets: service.CommonSystemServiceImplementation<Systems["asset"]>
};

const inlineThrow = (error: unknown) => { throw error };

export const createInsecureArtifactImplementation = (): ArtifactImplementation => {
  return {
    assets: {
      create(input) {
        return {
          id: nanoid(),
          ownerId:        input.ownerId ?? inlineThrow(new Error('Required')),
          contentType:    input.contentType ?? inlineThrow(new Error('Required')),
          contentLength:  input.contentLength ?? inlineThrow(new Error('Required')),
          createdAt:      Date.now(),
          uploadedAt:     null,
          state:          'pending',
          users:          input.users ?? inlineThrow(new Error('Required')),
        }
      },
      update(prev, input) {
        return {
          ...prev,
          state:      input.state || prev.state,
          uploadedAt: (input.state !== prev.state && input.state === 'uploaded') ? Date.now() : prev.uploadedAt,
        };
      },
      calculateKey(input) {
        return {
          part: input.ownerId,
          sort: input.id,
        };
      }
    }
  }
}

export const createArtifactMemoryBackend = (
  implementation: ArtifactImplementation
): ArtifactMemoryBackend => {
  const assetStorage = service.createMemoryStore<Systems["asset"]>(systems.asset)
  return {
    assets: {
      ...service.createMemoryChannels(systems.asset, implementation.assets),
      storage: assetStorage,
    },
    memory: {
      asset: assetStorage,
    }
  }
}

export type ArtifactService = {
  assets: Meta["Components"]["asset"]["service"],
  url: URLService,
  blob: BlobStreamService,
};

export const createArtifactService = (
  backend: ArtifactBackend,
  implementation: ArtifactImplementation,
  host: string,
): ArtifactService => {
  const assets = service.createCommonSystemService<Systems["asset"]>({
    ...backend.assets,
    definition: systems.asset,
    implementation: implementation.assets
  })

  const url = createLocalURLService(host);
  const blob = createMemoryBlobStreamService(assets);

  return {
    assets,
    url,
    blob,
  }
}

export type URLService = {
  createDownloadURL: (asset: AssetID, ownerId: string) => Promise<URL>,
  createUploadURL: (asset: AssetID, ownerId: string) => Promise<URL>,
};

/**
 * Create a URL service that returns URLS
 * from the current machine.
 */
export const createLocalURLService = (host: string): URLService => {
  const createDownloadURL = async (assetId: AssetID, ownerId: string) => {
    const url = new URL('/artifact/bytes', host);
    url.search = new URLSearchParams({ assetId, ownerId }).toString();
    return url;
  };
  const createUploadURL = async (assetId: AssetID, ownerId: string) => {
    const url = new URL('/artifact/bytes', host);
    url.search = new URLSearchParams({ assetId, ownerId }).toString();
    return url;
  }
  return { createDownloadURL, createUploadURL }
}


export const createMemoryService = (host = "http://artifact"): {
  backend: ArtifactMemoryBackend,
  service: ArtifactService
} => {
  const implementation = createInsecureArtifactImplementation()
  const backend = createArtifactMemoryBackend(implementation);
  const service = createArtifactService(backend, implementation, host)
  return { backend, service };
}