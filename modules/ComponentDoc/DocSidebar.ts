import { DocSheet, calculateSheetPath, getSheetParents } from "./DocElement.ts";
import { act } from './deps.ts';

// @deno-types="vite-css"
import classes from './DocSidebar.module.css';

const { h } = act;

export type DocSidebarProps = {
  allSheets: DocSheet[],
  selectedSheetId: DocSheet["id"]
}

export const DocSidebar: act.Component<DocSidebarProps> = ({
  allSheets,
  selectedSheetId,
  children,
}) => {
  const topLevelSheets = allSheets.filter(s => !s.parentId);
  const selectedSheet = allSheets.find(s => s.id === selectedSheetId);

  const selectedParents = selectedSheet && getSheetParents(allSheets, selectedSheet) || [];

  return h('div', { className: classes.root }, [
    children,
    h('nav', { className: classes.list }, [
      topLevelSheets.map(sheet =>
        h(DocSitebarEntry, {
          key: sheet.id,
          sheet,
          allSheets,
          selectedSheetId,
          selectedParents
        })),
    ])
  ]);
}

export type DocSitebarEntryProps = {
  key: string,
  
  allSheets: DocSheet[],
  selectedParents: DocSheet[],
  sheet: DocSheet,
  depth?: number,

  selectedSheetId: DocSheet["id"]
}

const DocSitebarEntry: act.Component<DocSitebarEntryProps> = ({
  sheet,
  allSheets,
  selectedSheetId,
  selectedParents,

  depth = 0,
}) => {
  const childSheets = allSheets.filter(s => s.parentId === sheet.id);
  const selected = selectedSheetId === sheet.id;
  const childSelected = selectedParents.find(p => p.id === sheet.id);

  return [
    h('li', {
      key: sheet.id,
      classList: [classes.entry, selected && classes.selected],
      style: { marginLeft: (depth * 32) + 'px' }
    },
    selected
      ? sheet.id
      : h('a', { href: "/" + calculateSheetPath(allSheets, sheet) }, sheet.id)),
    (selected || childSelected) && childSheets.map(sheet =>
      h(DocSitebarEntry, {
        key: sheet.id,
        sheet, allSheets,
        selectedSheetId,
        selectedParents,
        depth: depth + 1
      })) || null,
  ]
}