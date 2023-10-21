import { Asset } from "./models.ts";
import { ArtifactService } from "./service.ts";

export type ArtifactClient = {
  uploadFile: (file: File) => Promise<Asset>,
};

export const createServiceClient = (
  service: ArtifactService,
  ownerId: string,
): ArtifactClient => {
  return {
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
      return asset;
    }
  }
}