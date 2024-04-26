import { Vector, vec2 } from 'space/mod.ts';
import { useOverlayRoot, useOverlayedElement } from 'kayo/mod.ts';
import { act } from "../deps";
import { Action, Menu, MenuID, MenuItem, Submenu } from "./menu";

import classNames from './MenuDropdown.module.css';

const { h, useState } = act;

export type MenuDropdownProps = {
  menu: Menu,
  position: Vector<2>,
  onSubmenuClick?: (submenu: Submenu, position: Vector<2>) => unknown,
  onActionClick?: (action: Action, e: Event) => unknown,
}

export const MenuDropdown: act.Component<MenuDropdownProps> = ({
  menu,
  position,
  onSubmenuClick,
  onActionClick,
}) => {
  const root = useOverlayRoot();
  const ref = act.useRef<HTMLElement | null>(null);
  useOverlayedElement(ref);

  return h('null', {},
    h('div', { ref, style: { transform: `translate(${position.x}px, ${position.y}px)` }, className: classNames.dropdown }, [
      menu.items.map(item => {
        switch (item.type) {
          case 'action': {
            const onClick = (e: Event) => {
              if (onActionClick)
                onActionClick(item, e)
            };
            return h('button', { onClick, className: classNames.button }, item.content);
          }
          case 'submenu': {
            const onClick = (e: Event) => {
              const el = (e.target as  HTMLElement);
              const rect = el.getBoundingClientRect();
              const rootRect = root.getBoundingClientRect();
              const x = rect.right - rootRect.x;
              const y = rect.top - rootRect.y;
              if (onSubmenuClick)
                onSubmenuClick(item, vec2(x, y));
            }
            return h('button', { onClick, className: classNames.button }, [item.content, ' >']);
          }
          default:
            return null;
        }
      })
  ]));

}