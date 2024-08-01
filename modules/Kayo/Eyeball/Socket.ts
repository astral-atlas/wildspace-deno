import { act } from "../deps";
import { Curtain } from "./Curtain";
import { DialogueContainer } from "./DialogueContainer";
import { EyeballEngine } from "./engine";

export type SocketProps = {
  engine: EyeballEngine,
};

export const Socket: act.Component<SocketProps> = ({ engine, children }) => {
  const showCurtain = engine.dialogues.length > 0;

  const topDialogue = engine.dialogues[engine.dialogues.length - 1];

  const dissmissable = topDialogue && !topDialogue.required;
  const onDismiss = () => {
    if (topDialogue) {
      engine.closeDialogue(topDialogue.id);
    }
  }

  return act.h('div', { style: { flex: 1 }}, [
    children,
    showCurtain && act.h(Curtain, { onDismiss, dissmissable }),
    topDialogue && act.h(DialogueContainer, { entry: topDialogue })
  ]);
};
