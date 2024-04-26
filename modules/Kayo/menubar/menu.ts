import { act } from "../deps.ts"

export type MenuID = string;

export type Menu = {
  id: MenuID,
  items: MenuItem[]
}

export type MenuItem =
  | Submenu
  | Action

export type Action = {
  type: 'action',
  content: act.ElementNode,
  onClick?: (e: Event) => unknown
}

export type Submenu = {
  type: 'submenu',
  content: act.ElementNode,
  submenu: Menu,
}