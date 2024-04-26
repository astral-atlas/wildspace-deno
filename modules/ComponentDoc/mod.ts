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

export * from './common/mod.ts';
export * from './EventList.ts';

import { actMarkdown, act } from './deps.ts';

export const { h, useEffect, useRef, useContext, useState, useMemo } = act

export type MarkdownDirectiveComponentProps = actMarkdown.MarkdownDirectiveComponentProps;
export type ComponentMap<T extends act.Props> = actMarkdown.ComponentMap<T>

export type DirectiveComponent = act.Component<actMarkdown.MarkdownDirectiveComponentProps>;

export type DirectiveMap = Record<string, DirectiveComponent>;