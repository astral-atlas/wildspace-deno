import { Vector } from 'space/mod.ts';
import { act } from "../deps";
import { Menu, MenuID, MenuItem } from "./menu";

const { h, useState } = act;

export type MenuDropdownProps = {
  menu: Menu,
  placement: MenuDropdownPlacement,
}

export type MenuDropdownPlacement = {
  position: Vector<2>,
};

const calcIsMenuActive = (menu: Menu, activeMenuId: string): boolean => {
  if (menu.id === activeMenuId)
    return true;
  return menu.items.some(item => item.type === "submenu" && calcIsMenuActive(item.submenu, activeMenuId))
}

export const MenuDropdown: act.Component<MenuDropdownProps> = ({
  menu,
}) => {
  const [dropdownPlacement, setDropdownPlacement] = useState<null | Vector<2>>(null);
  const onSubmenuFocus = (menuId: MenuID) => {

  }
  const ref = act.useRef();
  act.useEffect(() => {
    console.log(ref);
  }, [])

  return h('null', {}, h('div', { ref }, [
    'A div'
  ]));

  return h('div', {}, menu.items.map(item => {
    switch (item.type) {
      case 'action':
        return h('button', {  }, item.content);
      case 'submenu':
        return h(MenuDropdown, { activeMenuId, menu: item.submenu, onFocus: onSubmenuFocus })
      default:
        return null;
    }
  }))
}