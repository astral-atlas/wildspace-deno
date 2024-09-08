import { FramePresenter } from "../../ComponentDoc/FramePresenter";
import { act } from "../deps";
import { Debugger } from "./engine/Debugger";
import { useEngine } from "./engine/engine";
import { EyeballProvider } from "./engine/Provider";

export const EngineDemo = () => {
  const engine = useEngine();

  const onCreateDropdownClick = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLButtonElement;

    engine.dropdowns.add(engine.core.getElementScreenspaceRect(button), "Dropdown!");
  }

  return [
    act.h(FramePresenter, {}, [
      act.h(EyeballProvider, { engine }, [
        act.h('button', { onClick: onCreateDropdownClick }, 'Create Dropdown')
      ])
    ]),
    act.h(FramePresenter, {}, [
      act.h(Debugger, { engine })
    ])
  ]
};