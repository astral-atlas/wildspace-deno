import { DirectiveComponent, FramePresenter, doc, useEventRecord, EventList } from "../../ComponentDoc/mod";
import { act } from "../deps";
import { MenuBar } from "./MenuBar";
import { Menu } from "./menu";

const menu_demo: DirectiveComponent = () => {
  const actions = useEventRecord<string>('action')

  const menu: Menu = {
    id: 'bar',
    items: [
      { type: 'action', content: 'Click me!', onClick: () => actions.submit('Click me!') },
      { type: 'action', content: 'Or me!', onClick: () => actions.submit('Or me!') },
      { type: 'submenu', content: 'More actions', submenu: {
        id: 'foo',
        items: [
          { type: 'action', content: 'Another one!', onClick: () => actions.submit('Another one!') }
        ]
      } },
    ]
  }
  const action = (e: string) => {
    return e;
  };
  return act.h(FramePresenter, { events: { renderEvent: { action } } }, [
    act.h(MenuBar, { menu })
  ]);
}

doc({
  id: "Wizard Staff",
  parentId: 'Wizard',
  readmeURL: new URL('./readme.md', import.meta.url),
  directiveComponents: {
    menu_demo
  }
});
