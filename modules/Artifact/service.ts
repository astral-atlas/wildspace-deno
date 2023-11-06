import { network, simpleSystem, storage } from "./deps.ts";
import { Asset } from "./models.ts";
import { transactionDefs, Transactions, ArtifactSystem } from "./system.ts";

export type Service = {
  uploadAsset(gameId: string, data: Blob): Promise<Asset>;
  downloadAsset(gameId: string, assetId: string): Promise<Blob>;
};

export const createRemoteService = (domain: network.DomainClient): Service => {
  const getClient = network.createTransactionHTTPClient<Transactions["get"]>(
    transactionDefs.get,
    domain
  );
  const postClient = network.createTransactionHTTPClient<Transactions["post"]>(
    transactionDefs.post,
    domain
  );

  return {
    async uploadAsset(gameId, data) {
      const {
        body: { asset, uploadURL },
      } = await postClient({
        request: {
          gameId,
          contentLength: data.size,
          contentType: data.type,
        },
        query: {},
      });
      await domain.http.request({
        url: new URL(uploadURL),
        headers: {},
        method: "POST",
        body: data.stream(),
      });
      return asset;
    },
    async downloadAsset(gameId, assetId) {
      const {
        body: { asset, downloadURL },
      } = await getClient({
        request: null,
        query: { gameId, assetId },
      });
      const { body } = await domain.http.request({
        url: new URL(downloadURL),
        headers: {},
        method: "GET",
        body: null,
      });
      if (!body) throw new Error(`No body returned for asset`);
      return new Blob(
        [await network.readSizedByteStream(body, asset.contentLength)],
        {
          type: asset.contentType,
        }
      );
    },
  };
};

export const createBackendService = (
  userId: string,
  assets: simpleSystem.Components<ArtifactSystem>,
  assetBlobs: storage.BlobStreamService,
): Service => {
  return {
    async uploadAsset(gameId, data) {
      const asset = await assets.service.create({
        gameId,
        uploader: userId,
        contentType: data.type,
        contentLength: data.size,
        users: [],
      });
      await assetBlobs.uploadStream(
        [gameId, asset.id].join(":"),
        data.stream()
      );
      await assets.service.update({ gameId, assetId: asset.id }, {
        type: 'complete-upload',
      });
      return asset;
    },
    async downloadAsset(gameId, assetId) {
      const asset = await assets.service.read({ gameId, assetId });
      const stream = await assetBlobs.downloadStream(
        [gameId, assetId].join(":")
      );
      return new Blob(
        [await network.readSizedByteStream(stream, asset.contentLength)],
        {
          type: asset.contentType,
        }
      );
    },
  };
};
