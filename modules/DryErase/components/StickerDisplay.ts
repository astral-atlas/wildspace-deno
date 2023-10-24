import { act, actCommon, artifact, desk, schedule } from "../deps.ts";
import { Sticker, StickerContent } from "../models.ts";
import { WhiteboardLocalState, useWhiteboardSelector } from "./useWhiteboardState.ts";

const { h, useRef, useEffect, useState } = act;

export type StickerDisplayProps = {
  panning: boolean,
  state: WhiteboardLocalState,
  artifact?: artifact.ArtifactClient,
  stickerId: Sticker["id"],
}

export const style = {
  stickerContainer: {
    backgroundColor: 'red',
    top: 0,
    left: 0,
    position: 'absolute',
  },
  note: { 
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
    resize: 'none',
  },
  assetImage: {
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
    pointerEvents: 'none'
  },
  dragButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
} as const;

export const StickerDisplay: act.Component<StickerDisplayProps> = ({
  state,
  stickerId,
  artifact,
  panning
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const dragRef = useRef<HTMLElement | null>(null);
  const dragRef2 = useRef<HTMLElement | null>(null);
  const sticker = useWhiteboardSelector(state, (state) =>
    state.stickers.get(stickerId), null)

  if (!sticker)
    return null;

  const size = useWhiteboardSelector(state, () => sticker.size, { x: 0, y: 0 })
  const content = useWhiteboardSelector(state, () => sticker.content, { type: 'null' })

  const selected = useWhiteboardSelector(
    state,
    data =>
      data.selected.type === 'sticker' && data.selected.stickerId === sticker.id,
    false
  );

  schedule.useAnimation('Sticker', () => {
    const { current } = ref;
    if (!current)
      return;
    const x = sticker.position.x + state.camera.x;
    const y = sticker.position.y + state.camera.y;
    current.style.transform = `translate(${x}px, ${y}px)`
  })

  const [pos, setPos] = useState(sticker.position);
  const [siz, setSiz] = useState(sticker.size);
  const [ready, setReady] = useState(false)
  const { events: resizeEvents } = desk.useDraggableSurface(dragRef, (_, __, event) => {
    if (ready && selected)
      state.channel.send({
        type: 'update-object',
        update: {
          type: 'transform',
          position: null,
          size: {
            x: siz.x + event.delta.x,
            y: siz.y + event.delta.y,
          }
        }
      })
  })
  const { events: moveEvents } = desk.useDraggableSurface(dragRef2, (_, __, event) => {
    if (ready && selected)
      state.channel.send({
        type: 'update-object',
        update: {
          type: 'transform',
          position: {
            x: pos.x + event.delta.x,
            y: pos.y + event.delta.y,
          },
          size: null
        }
      })
  })
  useEffect(() => {
    const onDragEvent = (event: desk.DragEvent) => {
      switch (event.state) {
        case 'start-drag': {
          setPos(sticker.position);
          setSiz(sticker.size);
          setReady(true);
          return state.channel.send({
            type: 'select-object',
            target: { type: 'sticker', stickerId: sticker.id }
          });
        }
        case 'end-drag': {
          return setReady(false);
        }
      }
    };
    const resizeSub = resizeEvents.subscribe(onDragEvent);
    const moveSub = moveEvents.subscribe(onDragEvent);
    return () => {
      setReady(false)
      resizeSub.unsubscribe();
      moveSub.unsubscribe();
    }
  }, [resizeEvents, moveEvents])

  return h('div', { ref, style: {
    ...style.stickerContainer,
    width: `${size.x}px`,
    height: `${size.y}px`,
    pointerEvents: panning ? 'none' : 'auto'
 } }, [
    h(StickerContent, { sticker, content, state, selected, artifact }),
    h('button', { style: style.dragButton, ref: dragRef }, '+'),
    h('button', { style: {...style.dragButton, right: '20px'}, ref: dragRef2 }, 'x'),
  ])
};

export type StickerContentProps = {
  content: StickerContent,
  sticker: Sticker,
  state: WhiteboardLocalState,
  selected: boolean,
  artifact?: artifact.ArtifactClient,
}

const StickerContent: act.Component<StickerContentProps> = ({
  sticker,
  content,
  state,
  selected,
  artifact,
}) => {
  switch (content.type) {
    case 'null':
    default:
      return h(NullStickerContent, { sticker, state, artifact });
    case 'note':
      return h(NoteStickerContent, { sticker, state, content, selected })
    case 'asset':
      return !!artifact && h(AssetStickerContent, { sticker, state, artifact, content, selected })
  }
};

export type NullStickerContentProps = {
  sticker: Sticker,
  state: WhiteboardLocalState,
  artifact?: artifact.ArtifactClient,
}

export const NullStickerContent: act.Component<NullStickerContentProps> = ({
  state,
  sticker,
  artifact,
}) => {
  const onClick = () => {
    state.channel.send({
      type: 'select-object',
      target: { type: 'sticker', stickerId: sticker.id }
    });
    state.channel.send({
      type: 'update-object',
      update: {
        type: 'content',
        content: { type: 'note', text: "New Note" }
      }
    })
  }
  const onBecomeImageClick = () => {
    if (!artifact)
      return;
    const element = document.createElement('input');

    const onInput = async () => {
      if (!element.files)
        return;
      const file = element.files[0]
      const asset = await artifact.uploadFile(file);
      state.channel.send({
        type: 'select-object',
        target: { type: 'sticker', stickerId: sticker.id }
      });
      state.channel.send({
        type: 'update-object',
        update: {
          type: 'content',
          content: { type: 'asset', assetId: asset.id, ownerId: artifact.ownerId }
        }
      })
      element.removeEventListener('input', onInput);
    }

    element.type = "file";
    element.accept = "image/*";
    element.addEventListener('input', onInput);
    element.click()
  }

  return [
    h('button', { onClick }, 'Become Note'),
    h('button', { onClick: onBecomeImageClick }, 'Become Image'),
  ];
}

type AssetStickerContentProps = {
  content: Extract<StickerContent, { type: 'asset' }>,
  sticker: Sticker,
  state: WhiteboardLocalState,
  selected: boolean,
  artifact: artifact.ArtifactClient,
}
export const AssetStickerContent: act.Component<AssetStickerContentProps> = ({
  content,
  artifact
}) => {

  const asset = actCommon.useAsync(() => artifact.downloadAsset(content.ownerId, content.assetId), [
    content.ownerId, content.assetId
  ])

  const { url } = actCommon.useDisposable(() => {
    if (!asset)
      return { url: null };
    const url = URL.createObjectURL(asset);
    const dispose = () => URL.revokeObjectURL(url);
    return { url, dispose }
  }, [asset])

  return url && h('img', { src: url, style: style.assetImage })
}

type NoteStickerContentProps = {
  content: Extract<StickerContent, { type: 'note' }>,
  sticker: Sticker,
  state: WhiteboardLocalState,
  selected: boolean,
}

export const NoteStickerContent: act.Component<NoteStickerContentProps> = ({
  content,
  state,
  sticker,
  selected
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const onInput = () => {
    if (!ref.current || !selected)
      return;
    const text = ref.current.value;
    state.channel.send({
      type: 'update-object',
      update: {
        type: 'content',
        content: { type: 'note', text }
      }
    })
  }
  const onFocus = () => {
    if (!selected)
      state.channel.send({
        type: 'select-object',
        target: { type: 'sticker', stickerId: sticker.id }
      });
  }

  return h('textarea', {
    ref,
    onInput,
    onFocus,
    value: content.text,
    style: style.note
  })
}