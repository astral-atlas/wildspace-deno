import { service, nanoid, m } from "../deps.ts";
import { WhiteboardBackendServiceDependencies, WhiteboardTypes, systems } from "../service.ts";

export const createNoteService = (deps: WhiteboardBackendServiceDependencies) => {
  return service.createCommonSystemService<WhiteboardTypes["noteSystem"]>({
    storage: deps.note.storage,
    channel: deps.note.channel,
    definition: systems.note,
    implementation: {
      calculateKey(item) {
        return { part: item.whiteboardId, sort: item.id };
      },
      create(input) {
        
      },
      update(prev, input) {
        
      },
    },
  });
}