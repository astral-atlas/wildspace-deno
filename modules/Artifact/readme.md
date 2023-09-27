# Artifact

Wildspace asset store.

Backends:

|Backend|Platforms|Dependencies|
|-|-|-|
|Memory|All|None|
|File|Server|FileSystem access|
|AWS|Server|S3 Bucket|

## Upload

Upload image assets using the artifact service.

::uploadButtonDemo

## Download

This demo uses [NetworkCommon](./NetworkCommon)'s fake internet
to download assets given their assetId.

::artifactDemo
