import { act, artifact, desk, formula, journal, kayo, Color } from "../../deps.ts";
import { JengaBlock, JengaRect, JengaSlideContent } from "../../jenga.ts";

const { h, useEffect, useRef, useState } = act;

export type JengaEditorPanelProps = {
  gameController?: null | journal.GameController,

  content: JengaSlideContent;
  onContentEdit: (nextContent: JengaSlideContent) => unknown;

  selectedIndex: number;
  onSelectedIndexChange: (nextIndex: number) => unknown;
};

const styles = {
  editorPanelContainer: {
    position: 'absolute',
    bottom: '24px',
    right: '24px'
  }
} as const;

export const JengaEditorPanel: act.Component<JengaEditorPanelProps> = ({
  content,
  onContentEdit,
  gameController,
  
  selectedIndex,
  onSelectedIndexChange,
}) => {
  const selectedBlock = content.blocks[selectedIndex];

  const onSelectedBlockEdit = (nextBlock: JengaBlock) => {
    if (!selectedBlock)
      return;
    onContentEdit({
      ...content,
      blocks: content.blocks.map(b => b === selectedBlock ? nextBlock : b),
    });
  }
  const onChangeText = (e: InputEvent) => {
    if (!selectedBlock)
      return;
    const inputElement = (e.target as HTMLInputElement);
    const nextBlock = {
      ...selectedBlock,
      textContent: inputElement.value,
    };
    onContentEdit({
      ...content,
      blocks: content.blocks.map(b => b === selectedBlock ? nextBlock : b),
    });
  }

  return h("div", { style: styles.editorPanelContainer }, [
    selectedBlock && h("div", { style: { display: 'flex', flexDirection: 'column' } }, [
      h('textarea', { value: selectedBlock.textContent, onInput: onChangeText }),
      !!gameController && h('div', {}, [
        h(artifact.UploadButton, {
          gameId: gameController.gameId,
          artifact: gameController.artifact,
          accept: 'image/*',
          onUpload(asset) {
            onSelectedBlockEdit({
              ...selectedBlock,
              imageContent: { assetId: asset.id },
            });
          },
        }),
        h('button', {
          onClick() {
            onSelectedBlockEdit({
              ...selectedBlock,
              imageContent: 'none',
            });
          }
        }, 'Clear')
      ]),
      h(FontEditor, { block: selectedBlock, onBlockEdit: onSelectedBlockEdit }),
      h(formula.NumberInput, {
        value: selectedBlock.styles.borderRadius,
        onInput: (borderRadius) => {
          onSelectedBlockEdit({
            ...selectedBlock,
            styles: {
              ...selectedBlock.styles,
              borderRadius
            }
          })
        }
      }),
      h(LayerEditor, { selectedIndex, content, onContentEdit, onSelectedIndexChange }),
      h(formula.NumberInput, {
        value: selectedBlock.styles.backgroundBlur === 'none' ? 0 : selectedBlock.styles.backgroundBlur.strength,
        onInput(value) {
          onSelectedBlockEdit({
            ...selectedBlock,
            styles: {
              ...selectedBlock.styles,
              backgroundBlur: { strength: value }
            }
          })
        },
      }),
      h(ColorStyleEditor, {
        styleName: 'backgroundColor',
        block: selectedBlock, onBlockEdit: onSelectedBlockEdit
      }),
      h(ColorStyleEditor, {
        styleName: 'borderColor',
        block: selectedBlock, onBlockEdit: onSelectedBlockEdit
      }),
      h(ColorStyleEditor, {
        styleName: 'textColor',
        block: selectedBlock, onBlockEdit: onSelectedBlockEdit
      }),
    ]),
    h("ol", {}, [
      content.blocks.map((block, index) => {
        const style = index === selectedIndex ? { fontWeight: 'bold' } : {};
        const onClick = () => {
          onSelectedIndexChange(index);
        }
        return h("li", { style, onClick }, block.textContent.slice(0, 10) || "<Empty Block>");
      }),
    ]),
  ]);
};

type ColorStyleEditorProps = {
  styleName: keyof JengaBlock["styles"],
  block: JengaBlock,
  onBlockEdit: (nextBlock: JengaBlock) => unknown,
}

const ColorStyleEditor: act.Component<ColorStyleEditorProps> = ({
  block, onBlockEdit, styleName
}) => {
  const styleColor = new Color(block.styles[styleName])

  const onColorInput = (e: InputEvent) => {
    const inputElement = (e.target as HTMLInputElement);
    const prevAlpha = styleColor.alpha();

    onBlockEdit({
      ...block,
      styles: {
        ...block.styles,
        [styleName]: new Color(inputElement.value).alpha(prevAlpha).hexa(),
      },
    });
  }
  const onTransparentInput = (e: InputEvent) => {
    const inputElement = (e.target as HTMLInputElement);
    const updatedColor = styleColor.alpha(inputElement.valueAsNumber).hexa();
    onBlockEdit({
      ...block,
      styles: {
        ...block.styles,
        [styleName]: updatedColor,
      },
    });
  }

  return h('div', {}, [
    h('input', {
      type: 'color',
      value: styleColor.hex(),
      onInput: onColorInput,
    }),
    h('input', {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.01,
      value: styleColor.alpha(),
      onInput: onTransparentInput,
    }),
  ])
}

type FontEditorProps = {
  block: JengaBlock,
  onBlockEdit: (nextBlock: JengaBlock) => unknown,
}
const FontEditor: act.Component<FontEditorProps> = ({ block, onBlockEdit }) => {
  const onInput = (value: string) => {
    onBlockEdit({
      ...block,
      styles: {
        ...block.styles,
        fontFamily: value,
      }
    })
  }
  const onWeightInput = (fontWeight: string) => {
    onBlockEdit({
      ...block,
      styles: {
        ...block.styles,
        fontWeight,
      }
    })
  }
  const onSizeInput = (fontSize: number) => {
    onBlockEdit({
      ...block,
      styles: {
        ...block.styles,
        fontSize,
      }
    })
  }
  return [
    h(formula.SelectInput, { onInput, value: block.styles.fontFamily, options: [
      'Roboto',
      'Roboto Slab',
      'Roboto Mono'
    ] }),
    h(formula.SelectInput, { onInput: onWeightInput, value: block.styles.fontWeight, options: [
      'normal',
      'bold',
      'lighter',
    ] }),
    h(formula.NumberInput, { onInput: onSizeInput, value: block.styles.fontSize }),
  ]
}

type LayerEditorProps = {
  selectedIndex: number,
  onSelectedIndexChange: (nextIndex: number) => unknown;
  content: JengaSlideContent;
  onContentEdit: (nextContent: JengaSlideContent) => unknown;
};
const LayerEditor: act.Component<LayerEditorProps> = ({
  selectedIndex,
  content,
  onContentEdit,
  onSelectedIndexChange
}) => {
  const onMoveLayer = (moveDelta: number) => () => {
    console.log(moveDelta, selectedIndex + moveDelta)
    onContentEdit({
      ...content,
      blocks: content.blocks.map((b, index) => {
        if (index === selectedIndex)
          return content.blocks[selectedIndex + moveDelta];
        if (index === selectedIndex + moveDelta)
          return content.blocks[selectedIndex];
        return b;
      })
    })
    onSelectedIndexChange(selectedIndex + moveDelta);
  }
  const top = selectedIndex === 0;
  const bottom = selectedIndex === content.blocks.length - 1;
  return h('div', {}, [
    h('button', { disabled: top, onClick: onMoveLayer(-1) }, 'Up'),
    h('button', { disabled: bottom, onClick: onMoveLayer(1) }, 'Down'),
    h('button', { disabled: top, onClick: onMoveLayer(-selectedIndex) }, 'Top'),
    h('button', { disabled: bottom, onClick: onMoveLayer(content.blocks.length - selectedIndex - 1) }, 'Bottom'),
  ])
}