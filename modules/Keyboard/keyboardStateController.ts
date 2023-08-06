import { createContext } from "https://esm.sh/@lukekaalim/act@2.6.0";

export type KeyboardStateController = {
  keysDown: Set<string>;
  onKeyboardEvent: (event: KeyboardEvent) => void;
};

export const createKeyboardStateController = (): KeyboardStateController => {
  const keysDown = new Set<string>();

  const onKeyboardEvent = (event: KeyboardEvent) => {
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
