import { act, actNavigation as nav } from "./deps.ts";

const {
  useEffect,
} = act;

export const useAnchorNavigation = (
  pageContainerRef: act.Ref<null | HTMLDivElement>,
  navigation: nav.Navigation,
) => {
  const { host, pathname } = navigation.location;

  // Handle navigation events if an "on click" event occurs
  useEffect(() => {
    const { current: site } = pageContainerRef;
    if (!site) return;
    
    const findAllParents = (node: Node): Node[] => {
      if (node.parentNode) return [node, ...findAllParents(node.parentNode)];
      return [node];
    };
    const onClick = (event: Event) => {
      const { target } = event;
      if (event.defaultPrevented)
        return;
      if (!(target instanceof Node))
        return;

      const parents = findAllParents(target);

      const anchor = [...parents.reverse()].find(
        (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement
      );
      const href = anchor && anchor.getAttribute('href')
      console.log(href);
      if (!href)
        return;

      const anchorURL = new URL(href, navigation.location);
      console.log(anchorURL);
      if (anchorURL.host !== host)
        return;

      if (anchorURL.pathname === pathname) {
        const hashElement = document.getElementById(anchorURL.hash.slice(1));
        // Always call "scrollIntoView" just in case we're clicking on a hash
        // we're are 'already at' - to retrigger the scroll animation
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
  }, [host, navigation, pathname]);
}