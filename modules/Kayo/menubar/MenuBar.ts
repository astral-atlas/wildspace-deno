import { Vector, vec2 } from "space/vectors";
import { useOverlayRoot } from "kayo/mod.ts";

import { MenuDropdown } from "./MenuDropdown";
import { Action, Menu, MenuID, Submenu } from "./menu";
import { act } from "../deps";

import classNames from './MenuBar.module.css';

const { h, useState } = act;

export type MenuBarProps = {
  menu: Menu,
};

export type SubmenuPlacement = {
  position: Vector<2>,
  menuId: string,
}

const findAllSubmenus = (menu: Menu): Menu[] => {
  const children = getMenuChildren(menu);
  return [
    children.map(c => c.submenu),
    children.map(c => findAllSubmenus(c.submenu))
      .flat(1)
  ].flat(1)
}
const getMenuChildren = (menu: Menu): Submenu[] => {
  return menu.items
    .filter((i): i is Submenu => i.type === 'submenu')
}

export const MenuBar: act.Component<MenuBarProps> = ({ menu }) => {
  const menusById = new Map(findAllSubmenus(menu).map(m => [m.id, m]));
  const [placements, setPlacements] = useState<SubmenuPlacement[]>([]);

  const root = useOverlayRoot();

  const onSubmenuClick = (submenuItem: Submenu, position: Vector<2>) => {
    const { submenu: { id } } = submenuItem;
    if (placements.some(p => p.menuId === id)) {
      const children = findAllSubmenus(submenuItem.submenu);
      setPlacements(placements.filter(p => p.menuId !== id && !children.some(c => c.id === p.menuId)))
      return;
    }
    const parent = placements
      .map(p => menusById.get(p.menuId))
      .filter((m): m is Menu => !!m)
      .find(menu => menu.items.some(item => item.type === 'submenu' && item.submenu.id === id));

    const placement: SubmenuPlacement = {
      position,
      menuId: id,
    }
    setPlacements(!parent ? [placement] : [placement, ...placements])
  }
  const onActionClick = (action: Action, e: Event) => {
    if (action.onClick)
      action.onClick(e)
    setPlacements([]);
  }

  return [
    h('div', { className: classNames.menuBar }, menu.items.map(item => {
      switch (item.type) {
        case 'action':
          return h('button', {
            className: classNames.menuButton,
            onClick: (e: Event) => onActionClick(item, e)
          }, item.content);
        case 'submenu':
          const onClick = (e: Event) => {
            const el = (e.target as  HTMLElement);
            const rect = el.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            
            const x = rect.x - rootRect.x;
            const y = rect.bottom - rootRect.y;
            onSubmenuClick(item, vec2(x, y));
          };
          return h('button', {
            className: classNames.menuButton,
            onClick
          }, item.content)
        default:
          return null;
      }
    })),
    placements.map(({ position, menuId }) => {
      const submenu = menusById.get(menuId);
      if (!submenu)
        return null;
      return h(MenuDropdown, { key: submenu.id, menu: submenu, position, onSubmenuClick, onActionClick })
    }),
  ]
};
