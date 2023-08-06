import { h, Component } from "https://esm.sh/@lukekaalim/act@2.6.0";

import {
  useRootNavigation,
  navigationContext,
} from "https://esm.sh/@lukekaalim/act-navigation@1.2.1";

import { DocSheet } from "./DocElement.ts";
import { DocPage } from "./DocPage.ts";
// @deno-types="vite-css"
import docSiteStyles from "./DocSite.module.css";

export type DocSiteProps = {
  sheets: DocSheet[];
  initialSheet: string;
};

export const DocSite: Component<DocSiteProps> = ({ sheets, initialSheet }) => {
  const navigation = useRootNavigation();

  const sheetMap = new Map(sheets.map((s) => [s.id, s]));

  const onSelectedSheetChange = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    const nextUrl = new URL(navigation.location);
    nextUrl.pathname = event.target.value;
    navigation.navigate(nextUrl);
  };
  const onNavClick = (sheetId: string) => (e: Event) => {
    e.preventDefault();
    const nextUrl = new URL(navigation.location);
    nextUrl.pathname = sheetId;
    navigation.navigate(nextUrl);
  };

  const selectedSheet =
    sheetMap.get(navigation.location.pathname.slice(1)) ||
    sheetMap.get(initialSheet);

  if (!selectedSheet) return null;

  return h(
    navigationContext.Provider,
    { value: navigation },
    h("div", {}, [
      h("nav", { class: docSiteStyles.sheetList }, [
        ...sheets.map((sheet) =>
          h("li",
            {},
            h("a", {
                href: sheet.id,
                onClick: onNavClick(sheet.id),
                classList: [
                  sheet.id === selectedSheet.id && docSiteStyles.selected,
                ],
              },
              sheet.id
            )
          )
        ),
      ]),
      !!selectedSheet && h(DocPage, { elements: selectedSheet.elements }),
    ])
  );
};
