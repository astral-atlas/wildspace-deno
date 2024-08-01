import { act } from "../deps";
import { DialogueEntry } from "./engine";

export type DialogueContainerProps = {
  entry: DialogueEntry
};

export const styles = {
  dialogueContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}

export const DialogueContainer: act.Component<DialogueContainerProps> = ({ entry }) => {
  return act.h('div', { style: styles.dialogueContainer }, [
    entry.render(entry)
  ]);
};
