import { act } from "../deps.ts";

const { h } = act;

export type CrystalBallProps = {

};

export const CrystalBall: act.Component<CrystalBallProps> = ({ children }) => {
  return h('div', { style: { maxHeight: '100vh', width: '300px', overflow: 'auto' } }, [
    children
  ]);
};
