import { act, actNavigation as nav } from "./deps.ts";

const {
  useEffect,
} = act;

export const useSmoothHashScroll = (
  pageContainerRef: act.Ref<null | HTMLDivElement>,
  navigation: nav.Navigation,
) => {
  const { hash, pathname } = navigation.location;

  // If there is a hash as part of the URL,
  // try to scroll it into view
  useEffect(() => {
    if (!hash) {
      const { current: pageContainer } = pageContainerRef;
      if (!pageContainer) return;
      pageContainer.scrollTo({ top: 0 });
      return;
    }
    const hashElement = document.getElementById(hash.slice(1));
    console.log({ hashElement })
    if (!hashElement) return;
    hashElement.scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "smooth",
    });
  }, [hash, pathname]);
}