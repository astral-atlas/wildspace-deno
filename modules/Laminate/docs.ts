import { doc, FramePresenter, urlSheet } from '@astral-atlas/component-doc';

const Demo = () => {
  return null;
}

doc({
  id: 'Laminate',
  readmeURL: new URL('./readme.md', import.meta.url),
  directiveComponents: { Demo },
})