import { act } from "../../deps";
import { Curtain } from "../Curtain";
import { EyeballEngine, useEngine } from "./engine";

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  children: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
} as const

export const EyeballProvider: act.Component<{ engine: EyeballEngine }> = ({ engine, children }) => {
  return act.h('div', { ref: engine.core.rootRef, style: styles.root }, [
    engine.dropdowns.render(),
    act.h('div', { style: styles.children }, children),
    engine.dropdowns.dropdowns.length > 0 && act.h(Curtain, { onClick : engine.dropdowns.clear, dimBackground: true, blockCursor: true }),
  ])
};

