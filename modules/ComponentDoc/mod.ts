export * from './DocElement.ts';
export * from './DocPage.ts';
export * from './DocSite.ts';
export * from './DocSidebar.ts';
export * from './FramePresenter.ts';
export * from './markdown.ts';
export * from './Blocks.ts';
export * from './DocContext.ts';
export * from './DocSite2.ts';
export * from './global.ts';

import { actMarkdown, act } from './deps.ts';

export type DirectiveComponent = act.Component<actMarkdown.MarkdownDirectiveComponentProps>;
