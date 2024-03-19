import { createContext } from "@lukekaalim/act";

export type KeyboardStateController = {
  keysDown: Set<string>;
  onKeyboardEvent: (event: KeyboardEvent) => void;
};

export const createKeyboardStateController = (): KeyboardStateController => {
  const keysDown = new Set<string>();

  const onKeyboardEvent = (event: KeyboardEvent) => {
    //event.preventDefault();
    switch (event.type) {
      case 'keydown':
        keysDown.add(event.code);
        break;
      case 'keyup':
        keysDown.delete(event.code);
        break;
    }
  };

  return { onKeyboardEvent, keysDown };
};

export const keyboardStateControllerContext = createContext(
  createKeyboardStateController()
);
