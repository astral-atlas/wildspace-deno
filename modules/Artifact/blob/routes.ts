import { network } from "../deps.ts";
import { BlobStreamService } from "./service.ts";

export const createBlobRoutes = (
  service: BlobStreamService
): network.http.Route[] => {
  const uploadRoute: network.http.HTTPRoute = {
    path: '/artifact/bytes',
    method: 'PUT',
    type: 'http',
    async handler({ body, url }) {
      const query = Object.fromEntries(url.searchParams.entries());
      const assetId = query.assetId;
      if (!body)
        throw new Error('No Uploaded asset');
      await service.uploadStream(assetId, body);
      return {
        status: 200,
        headers: {},
        body: null,
      }
    }
  }
  const downloadRoute: network.http.HTTPRoute = {
    path: '/artifact/bytes',
    method: 'GET',
    type: 'http',
    async handler({ body, url }) {
      const query = Object.fromEntries(url.searchParams.entries());
      const assetId = query.assetId;
      if (!assetId)
        throw new Error('No Asset ID Provided');

      const downloadStream = await service.downloadStream(assetId);
      
      return {
        status: 200,
        headers: {},
        body: downloadStream,
      }
    }
  }

  return [
    uploadRoute,
    downloadRoute
  ];
};