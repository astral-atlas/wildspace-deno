import { network } from "./deps.ts";
import { Asset } from "./models.ts";
import { ArtifactService } from "./service.ts";

export type ArtifactClient = {
  readonly ownerId: string,
  uploadFile: (file: File) => Promise<Asset>,
  downloadAsset: (ownerId: string, assetId: Asset["id"]) => Promise<Blob>,
};

export const createServiceClient = (
  service: ArtifactService,
  ownerId: string,
): ArtifactClient => {
  return {
    ownerId,
    async uploadFile(file) {
      const asset = await service.assets.create({
        ownerId,
        contentLength: file.size,
        contentType: file.type,
        state: 'pending',
        users: [],
      });
      await service.blob.uploadStream(
        ownerId, asset.id, file.stream()
      );
      const uploadedAsset = await service.assets.read({ ownerId, assetId: asset.id });
      return uploadedAsset;
    },
    async downloadAsset(ownerId, assetId) {
      const asset = await service.assets.read({ ownerId, assetId });
      const stream = await service.blob.downloadStream(
        ownerId, asset.id
      );
      const bytes = await network.readSizedByteStream(stream, asset.contentLength);
      return new Blob([bytes]);
    }
  }
}