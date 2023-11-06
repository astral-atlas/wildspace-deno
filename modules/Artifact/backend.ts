import { nanoid, sesameModels, simpleSystem, storage } from "./deps.ts";
import { Asset } from "./models.ts";
import { artifactSystemDef, ArtifactSystem } from "./system.ts";
import { Service, createBackendService } from './service.ts';

export type Backend = {
  assets: simpleSystem.Components<ArtifactSystem>,
  assetBlobs: storage.BlobStreamService,
  createService: (userId: sesameModels.SesameUserID) => Service,

  useAsset: (gameId: string, assetId: string, name: string) => Promise<Asset>,
  discardAsset: (gameId: string, assetId: string, userId: string) => Promise<Asset>,
};

export const createBackend = (world: simpleSystem.World): Backend => {
  const assets = simpleSystem.createComponents<ArtifactSystem>(world, {
    definition: artifactSystemDef,
    service: {
      create(input) {
        return {
          id: nanoid(),
          createdAt: Date.now(),
          uploadedAt: null,
          state: 'pending',
          uploadedBy: input.uploader,
          ...input,
        }
      },
      update(previous,input) {
        switch (input.type) {
          case 'add-user':
            return {
              ...previous,
              users: [...previous.users, input.user],
            };
          case 'remove-user':
            return {
              ...previous,
              users: previous.users.filter(u => u.id !== input.userId),
            };
          case 'complete-upload':
            return {
              ...previous,
              state: 'uploaded',
            }
        }
      },
      calculateKey(input) {
        return {
          part: input.gameId,
          sort: input.id,
        }
      },
    },
  });
  const assetBlobs = world.blobStorageProvider
    .createBlobStorage('assets')

  return {
    assets,
    assetBlobs,
    createService(userId) {
      return createBackendService(userId, assets, assetBlobs)
    },
    useAsset(gameId, assetId, name) {
      return assets.service.update({ gameId, assetId }, {
        type: 'add-user',
        user: {
          id: nanoid(),
          name
        }
      });
    },
    discardAsset(gameId, assetId, userId) {
      return assets.service.update({ gameId, assetId }, {
        type: 'remove-user',
        userId,
      });
    },
  }
};
