import { Vector, vec2 } from "space/vectors";
import { act } from "../deps";
import { MenuDropdown } from "./MenuDropdown";
import { Menu, MenuID } from "./menu";

const { h, useState } = act;

export type MenuBarProps = {
  menu: Menu,
};

export const MenuBar: act.Component<MenuBarProps> = ({ menu }) => {
  const [dropdownPlacement, setDropdownPlacement] = useState<null | Vector<2>>(null);
  const [submenu, setSubmenu] = useState<null | Menu>(null);

  return [
    h('div', {}, menu.items.map(item => {
      switch (item.type) {
        case 'action':
          return h('button', { onClick: (e: Event) => item.onClick && item?.onClick(e) }, item.content);
        case 'submenu':
          const onClick = (e: Event) => {
            setDropdownPlacement(vec2())
            setSubmenu(item.submenu);
          };
          return h('button', { onClick }, item.content)
        default:
          return null;
      }
    })),
    dropdownPlacement && submenu && h(MenuDropdown, { menu: submenu, placement: { position: dropdownPlacement } }),
  ]
};
