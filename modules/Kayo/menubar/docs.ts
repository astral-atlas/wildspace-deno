import { OverlayRoot } from "kayo/mod.ts";
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
      { type: 'submenu', content: 'Different actions', submenu: {
        id: 'glup',
        items: [
          { type: 'submenu', content: 'Woo sub sub menu!', submenu: {
            id: 'zip',
            items: [
              { type: 'action', content: 'Hard-to-find action', onClick: () => actions.submit('Hard-to-find action') },
              { type: 'action', content: 'Save file', onClick: () => actions.submit('Save') },
              { type: 'action', content: 'Delete File', onClick: () => actions.submit('Delete File') },
            ]
          } },
        ]
      } },
    ]
  }
  return act.h(FramePresenter, { events: { renderEvent: actions.renderer(e => e) } }, [
    act.h(OverlayRoot, {}, [
      act.h(MenuBar, { menu })
    ])
  ]);
}

doc({
  id: "Kayo Menubar",
  parentId: 'Kayo',
  readmeURL: new URL('./readme.md', import.meta.url),
  directiveComponents: {
    menu_demo
  }
});
