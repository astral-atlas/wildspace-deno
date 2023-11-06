import { dryErase, presentation, stage } from "./deps.ts";
import { ServerProtocol } from "./protocol.ts";
import { RoomContent } from "./room.ts";

export type RoomState = {
  content: RoomContent;
  resources: {
    scene: Map<string, stage.SceneNode>;
    slide: Map<string, presentation.Slide>;
    whiteboard: Map<string, dryErase.Whiteboard>;
  };
};

export const reduceRoomState = (state: RoomState, event: ServerProtocol) => {
  switch (event.type) {
    default:
      return state;
    case 'room-content-set':
      state.content = event.content;
      break;
    case "resource-set":
      switch (event.resource.type) {
        case "scene":
          state.resources.scene.set(event.key, event.resource.scene);
          break;
        case "slide":
          state.resources.slide.set(event.key, event.resource.slide);
          break;
        case "whiteboard":
          state.resources.whiteboard.set(event.key, event.resource.whiteboard);
          break;
      }
      return state;
  }
};
