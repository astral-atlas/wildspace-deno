import { act, actNavigation as nav } from "./deps.ts";

import { DocSheet } from "./DocElement.ts";
import { DocPage } from "./DocPage.ts";
import { DocSidebar } from "./DocSidebar.ts";
import { TopBar } from "./Topbar.ts";

import { useSmoothHashScroll } from "./useSmoothHashScroll.ts";
import { useAnchorNavigation } from './useAnchorNavigation.ts';

// @deno-types="vite-css"
import classes from './DocSite2.module.css';
import { calculateSheetPath } from "./DocElement.ts";

const { h, useRef } = act;

export type DocSite2Props = {
  navigation: nav.Navigation,
  sheets: DocSheet[],
  
  basePath?: string,
  sidebarHero?: act.ElementNode,
};

const calculateSelectedSheet = (
  navigation: nav.Navigation,
  sheets: DocSheet[],
  basePath: string,
): DocSheet | null => {
  const path = decodeURIComponent(navigation.location.pathname);

  if (!path.startsWith(basePath))
    return null;

  const relativePath = path.slice(basePath.length);

  const sheetPaths = sheets.map(sheet => {
    return { sheet, path: calculateSheetPath(sheets, sheet) }
  });
  const sheetPath = sheetPaths.find(sheet => sheet.path === relativePath);
  return sheetPath && sheetPath.sheet || null;
};

export const DocSite2: act.Component<DocSite2Props> = ({
  navigation,
  sheets,
  basePath = '/',

  sidebarHero = null,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const selectedSheet = calculateSelectedSheet(navigation, sheets, basePath) || sheets[0];
  const selectedSheetId = selectedSheet.id;

  useSmoothHashScroll(ref, navigation);
  useAnchorNavigation(ref, navigation);
  
  return h('div', { ref, className: classes.root }, [
    h(TopBar),
    h('div', { className: classes.main }, [
      h(DocSidebar, { allSheets: sheets, selectedSheetId }, sidebarHero),
      h('div', { className: classes.pageContainter },
        h('div', { className: classes.page },
          h(DocPage, { elements: selectedSheet.elements }),
        )
      )
    ])
  ]);
}