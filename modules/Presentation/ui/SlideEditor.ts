import { act, formula, m, artifact, journal } from "../deps.ts";
import {
  SlideContent,
  SlideAsset,
  classicSlideContendDef,
  titleSlideContendDef,
  imageSlideAssetDef,
  noneSlideAssetDef,
} from "../slide.ts";
import { style } from './styles.ts';

const { h } = act;

export type ContentEditorProps<T = SlideContent> = {
  content: T;
  onContentChange: (slide: T) => unknown;

  gameController: journal.GameController,
};

export const ContentEditor: act.Component<ContentEditorProps> = ({
  content,
  onContentChange,
  ...props
}) => {
  const getContentForm = () => {
    switch (content.type) {
      case "classic":
        return h(ClassicContentEditor, {
          content,
          onContentChange,
          ...props,
        });
      case 'title':
        return h('div', { style: style.titleContainer }, [
          h(formula.TextInput, {
            value: content.title,
            onInput: title => onContentChange({ ...content, title })
          }),
        ]);
    }
    return "unimplemeted";
  };

  return h("div", { style: style.editorRoot }, [
    h(ContentTypeEditor, { content, onContentChange, ...props, }),
    h('div', { style: style.slideContainer }, [
      getContentForm(),
    ]),
  ]);
};

export const ClassicContentEditor: act.Component<
  ContentEditorProps<Extract<SlideContent, { type: "classic" }>>
> = ({
  content, onContentChange,
  gameController,
}) => {
  return h('div', { style: style.classicSlideContainer }, [
    h('div', { style: style.heading }, [
      h(formula.TextInput, {
        value: content.heading,
        onInput: heading => onContentChange({ ...content, heading })
      }),
    ]),
    h('div', { style: style.description }, [
      h(formula.TextInput, {
        value: content.description,
        area: true,
        onInput: description => onContentChange({ ...content, description })
      }),
    ]),
    h(SlideAssetEditor, {
      content: content.background,
      onContentChange: background => onContentChange({ ...content, background }),
      gameController,
    })
  ]);
};

export const SlideAssetEditor: act.Component<ContentEditorProps<SlideAsset>> = ({
  content,
  onContentChange,
  gameController,
}) => {
  const renderAssetForm = () => {
    switch (content.type) {
      case 'image':
        return h(artifact.UploadButton, {
          gameId: gameController.gameId,
          artifact: gameController.artifact,
          onUpload(asset) {
            onContentChange({ ...content, assetId: asset.id })
          },
        })
      case 'none':
        return null;
    }
  }

  return [
    h(formula.SelectInput, {
      options: ['image', 'none'],
      value: content.type,
      onInput(value) {
        switch (value) {
          case 'image':
            return onContentChange(m.createDefaultValue(
              imageSlideAssetDef
            ))
          case 'none':
            return onContentChange(m.createDefaultValue(
              noneSlideAssetDef
            ))
        }
      },
    }),
    renderAssetForm(),
  ]
};

export const ContentTypeEditor: act.Component<ContentEditorProps> = ({
  content,
  onContentChange,
}) => {
  return h(formula.SelectInput, {
    value: content.type,
    options: ["title", "classic"],
    onInput(value) {
      switch (value) {
        case "title":
          return onContentChange(m.createDefaultValue(titleSlideContendDef));
        case "classic":
          return onContentChange(m.createDefaultValue(classicSlideContendDef));
      }
    },
  });
};
