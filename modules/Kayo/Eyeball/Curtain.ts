import { act } from "../deps";
import { EyeballEngine } from "./engine";

const styles = {
  curtain: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  }
};

export type CurtainProps = {
  dimBackground?: boolean,
  blockCursor?: boolean,
  pointer?: boolean,
  onClick?: () => void,
};

export const Curtain: act.Component<CurtainProps> = ({
  dimBackground,
  blockCursor,
  pointer,

  onClick,
}) => {
  const style = {
    ...styles.curtain,
    backgroundColor: dimBackground && '#00000085',
    pointerEvents: !blockCursor && 'none' ,
    cursor: pointer && 'pointer'
  };

  return act.h('div', {
    style,
    onClick
  });
};