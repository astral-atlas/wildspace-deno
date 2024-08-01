import { act } from "../deps";
import { EyeballEngine } from "./engine";

const styles = {
  curtain: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000085'
  }
};

export type CurtainProps = {
  dissmissable: boolean,
  onDismiss: () => void
};

export const Curtain: act.Component<CurtainProps> = ({ dissmissable, onDismiss }) => {
  return act.h('div', {
    style: { ...styles.curtain, cursor: dissmissable ? 'pointer' : 'auto' },
    onClick: onDismiss,
    disabled: !dissmissable
  });
};