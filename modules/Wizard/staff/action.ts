import { act } from "../deps";

export type ActionDataID = string;

export type Action =
  | MultipleActions
  | ClickableAction

export type MultipleActions = {
  type: 'multiple-actions'
  id: ActionDataID,
  content: act.ElementNode,
  actions: Action[],
}

export type ClickableAction = {
  type: 'clickable-action',
  id: ActionDataID,
  disabled: boolean,
  content: act.ElementNode,
  onClick: () => unknown,
}