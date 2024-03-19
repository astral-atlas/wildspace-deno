import { Ref, useContext, useEffect } from "@lukekaalim/act";
import { keyboardStateControllerContext } from "./keyboardStateController.ts";

export const useKeyboardElementRef = (ref: Ref<null | HTMLElement>) => {
  const keyboard = useContext(keyboardStateControllerContext);
  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    element.addEventListener('keydown', keyboard.onKeyboardEvent);
    element.addEventListener('keyup', keyboard.onKeyboardEvent);
    return () => {
      element.removeEventListener('keydown', keyboard.onKeyboardEvent);
      element.removeEventListener('keyup', keyboard.onKeyboardEvent);

    }
  }, [keyboard, ref]);
}