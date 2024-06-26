import { h, useState } from "@lukekaalim/act";
import { DocSheet } from "./DocElement.ts";
import { markdownToDoc, markdownToSheet } from "./markdown.ts";
// @deno-types="vite-text" 
import readme from './readme.md?raw';
import { DocSite, DocSite2 } from "./mod.ts";
import { FramePresenter } from "./FramePresenter.ts";
import { quickSheet } from "./markdown.ts";

export const frame_presenter_demo = () => {
  return h(FramePresenter, {}, [
    h('div', {}, [
      h('h3', {}, 'A title!'),
      h('button', {}, 'A button!')
    ])
  ])
}

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

const useFakeNavigation = (initialLocation = new URL('https://example.com')) => {
  const [location, setLocation] = useState(new URL(initialLocation))
  const navigate = (location: URL) => {
    setLocation(location)
  };

  return { navigate, location };
}

const DocSite2Demo = () => {
  const navigation = useFakeNavigation();
  const sheets = [
    quickSheet('Home', '# Doc Home\nHome Stuff!\n\n## A Sub Heading'),
    quickSheet('First Child', '# Cain', 'Home'),
    quickSheet('Second Child', '# Able', 'Home'),
    quickSheet('Deep', '# Deep', 'Second Child'),
    quickSheet('Child', '# Child', 'Second Child'),
    quickSheet('Second Home', '# Home away from Home'),
    quickSheet('Unselectable Path', '# Mystery', 'No Home'),
  ];

  const sidebarHero = [
    h('h3', {}, '😎 Cool Demo App')
  ]

  return [
    h('div', {}, h('pre', {}, navigation.location.href)),
    h(FramePresenter, {}, [
      h(DocSite2, { navigation, basePath: '/', sheets, sidebarHero })
    ])
  ];
}

const demos = {
  frame_presenter_demo,
  'docsite': DocSiteDemo,
  DocSite2Demo,
}

export const componentDocDocs: DocSheet[] = [
  markdownToSheet('ComponentDoc', readme, demos)
];
