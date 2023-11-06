import { Backend } from "./backend.ts";
import { network } from "./deps.ts";
import { transactionDefs, Transactions } from "./system.ts";

export const createRoutes = (backend: Backend, origin: string) => {
  const getData: network.HTTPRoute = {
    type: "http",
    path: "/data",
    method: "GET",
    async handler({ url }) {
      const { gameId, assetId } = Object.fromEntries(
        url.searchParams.entries()
      );
      const asset = await backend.assets.service.read({ gameId, assetId });
      const stream = await backend.assetBlobs.downloadStream(
        [gameId, assetId].join(":")
      );
      return {
        status: 200,
        headers: {
          "content-type": asset.contentType,
          "content-length": asset.contentLength.toString(),
        },
        body: stream,
      };
    },
  };
  const postData: network.HTTPRoute = {
    type: "http",
    path: "/data",
    method: "POST",
    async handler({ url, body }) {
      if (!body)
        return {
          status: 401,
          body: new Blob([new TextEncoder().encode("Where is body?")]).stream(),
          headers: {} as network.http.HTTPHeaders,
        };
      const { gameId, assetId } = Object.fromEntries(
        url.searchParams.entries()
      );
      const asset = await backend.assets.service.read({ gameId, assetId });
      await backend.assetBlobs.uploadStream([gameId, assetId].join(":"), body);
      return {
        status: 200,
        headers: {
          "content-type": asset.contentType,
          "content-length": asset.contentLength.toString(),
        } as network.http.HTTPHeaders,
        body: null,
      };
    },
  };
  const createDataURL = (gameId: string, assetId: string) => {
    const downloadURL = new URL(getData.path, origin);
    downloadURL.search = new URLSearchParams({
      assetId,
      gameId,
    }).toString();
    return downloadURL.href;
  };

  const getAsset = network.createTransactionHTTPRoute<Transactions["get"]>(
    transactionDefs.get,
    async ({ query: { gameId, assetId } }) => {
      const asset = await backend.assets.service.read({ gameId, assetId });
      const downloadURL = createDataURL(gameId, assetId);
      return { body: { downloadURL, asset }, status: 200 };
    }
  );
  const postAsset = network.createTransactionHTTPRoute<Transactions["post"]>(
    transactionDefs.post,
    async ({ request: { gameId, contentLength, contentType } }) => {
      const asset = await backend.assets.service.create({
        gameId,
        // TODO
        uploader: '',
        contentLength,
        contentType,
        users: [],
      });
      const dataURL = createDataURL(gameId, asset.id);
      return {
        body: { asset, downloadURL: dataURL, uploadURL: dataURL },
        status: 201,
      };
    }
  );

  return [getData, postData, getAsset, postAsset];
};
