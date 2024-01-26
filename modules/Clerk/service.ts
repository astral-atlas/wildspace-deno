import { data } from "./deps.ts";
import { FileSystem } from "./system.ts";

export type Service = {
  ls: (directoryId: string) => void,
  mkdir: () => void,
};

export const createBackendService = (
  fileSystem: data.simpleSystem.Components<FileSystem>,
): Service => {
  
};