import { h, useState } from "https://esm.sh/@lukekaalim/act@2.6.0";
import { DocSheet } from "./DocElement.ts";
import { markdownToDoc, markdownToSheet } from "./markdown.ts";
// @deno-types="vite-text" 
import readme from './readme.md?raw';
import { DocSite } from "./DocSite.ts";
import { FramePresenter } from "./FramePresenter.ts";

const DocSiteDemo = () => {
  const embeddedComponents = {
    demo() {
      return h('button', {
        onclick() {
          alert('wowzers!')
        }
      }, 'Im an embedded component!')
    }
  }
  const [location, setLocation] = useState(new URL('https://example.com'))
  const navigate = (location: URL) => {
    setLocation(location)
  };

  return [
    h('pre', {}, location.href),
    h(FramePresenter, {}, [
      h(DocSite, {
        overrideNavigation: { navigate, location },
        sheets: [
          markdownToSheet('Page1', `# Hello!\nFrom page 1\n::demo`, embeddedComponents),
          markdownToSheet('Page2', `# World!\nFrom page 2`),
        ],
        initialSheet: 'Page1'
      })
    ])
  ];
}

const demos = {
  'docsite': DocSiteDemo
}

export const componentDocDocs: DocSheet[] = [
  markdownToSheet('ComponentDoc', readme, demos)
];
