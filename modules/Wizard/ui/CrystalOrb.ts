import { act } from '../deps.ts';
const { h } = act;

export type CrystalOrbProps = {

};

export const CrystalOrb = () => {
  return h('div', {}, [
    h('div', {}, 'Top bar'),
    h('div', {}, 'Explorer'),
  ]);
};
