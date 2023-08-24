import {
  h,
  Component,
  useEffect,
  useRef,
} from "https://esm.sh/@lukekaalim/act@2.6.0";

import {
  useRootNavigation,
  navigationContext,
  Navigation,
} from "https://esm.sh/@lukekaalim/act-navigation@1.2.1";

import { DocSheet } from "./DocElement.ts";
import { DocPage } from "./DocPage.ts";
// @deno-types="vite-css"
import docSiteStyles from "./DocSite.module.css";

export type DocSiteProps = {
  sheets: DocSheet[];
  initialSheet: string;
  baseURL?: string,

  overrideNavigation?: Navigation;
  disableInterceptAnchors?: boolean
};

export const DocSite: Component<DocSiteProps> = ({
  baseURL,
  sheets,
  initialSheet,
  overrideNavigation,
  disableInterceptAnchors = false, 
}) => {
  const localNavigation = useRootNavigation();
  const navigation = overrideNavigation || localNavigation;

  const sheetMap = new Map(sheets.map((s) => [s.id, s]));

  const onNavClick = (sheetId: string) => (e: Event) => {
    e.preventDefault();
    const nextUrl = new URL(navigation.location);
    nextUrl.pathname = sheetId;
    nextUrl.hash = '';
    navigation.navigate(nextUrl);
  };
  const { hash, pathname, host } = navigation.location;

  const ref = useRef<HTMLDivElement | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const { current: pageContainer } = pageContainerRef;
    if (!pageContainer) return;

    if (!hash) {
      pageContainer.scrollTo({ top: 0 });
      return;
    }
    const hashElement = document.getElementById(hash.slice(1));
    if (!hashElement) return;
    hashElement.scrollIntoView({
      block: "start",
      inline: "center",
      behavior: "smooth",
    });
  }, [hash, pathname]);
  useEffect(() => {
    const { current: site } = ref;
    if (!site) return;
    if (disableInterceptAnchors)
      return;
    const findAllParents = (node: Node): Node[] => {
      if (node.parentNode) return [node, ...findAllParents(node.parentNode)];
      return [node];
    };
    const onClick = (event: Event) => {
      const { target } = event;
      if (event.defaultPrevented)
        return;
      if (!(target instanceof Node)) return;
      const parents = findAllParents(target);
      const anchor = [...parents.reverse()].find(
        (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement
      );
      if (!anchor) return;
      const anchorURL = new URL(anchor.href);
      if (anchorURL.host !== host) return;
      if (anchorURL.pathname === pathname) {
        const hashElement = document.getElementById(anchorURL.hash.slice(1));
        hashElement?.scrollIntoView({
          block: "start",
          inline: "center",
          behavior: "smooth",
        });
      }
      navigation.navigate(anchorURL);
      event.preventDefault();
    };
    site.addEventListener("click", onClick);
    return () => {
      site.removeEventListener("click", onClick);
    };
  }, [host, navigation, pathname, disableInterceptAnchors]);

  const selectedSheet =
    sheetMap.get(navigation.location.pathname.slice(1)) ||
    sheetMap.get(initialSheet);

  if (!selectedSheet) return null;

  return h(
    navigationContext.Provider,
    { value: navigation },
    h("div", { class: docSiteStyles.site, ref }, [
      h("div", { class: docSiteStyles.sheetListContainer }, [
        h("nav", { class: docSiteStyles.sheetList }, [
          ...sheets.map((sheet) =>
            h("li",
              {},
              h("a",
                {
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
      ]),
      h("div", { class: docSiteStyles.pageContainer, ref: pageContainerRef }, [
        h("div", { class: docSiteStyles.page }, [
          !!selectedSheet && h(DocPage, { elements: selectedSheet.elements }),
        ]),
      ]),
    ])
  );
};
