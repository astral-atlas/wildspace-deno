import {
  DocSheet,
  FramePresenter,
  createDocContext,
  markdownToSheet,
} from "../ComponentDoc/mod.ts";
import { SystemComponentsPreview } from "../Data/DataDoc/mod.ts";
import { createBackend } from "../Universe/mod.ts";
import {
  act, actCommon, artifact,
  m, network, simpleSystem,
  journal,
} from "./deps.ts";
import { dotsURL, paperURL, streetURL } from "./docs/mod.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { Slide, slideDef } from "./slide.ts";
import { slideSystemDef } from "./system.ts";
import { SlideRenderer } from "./ui/SlideRenderer.ts";
import { ContentEditor } from "./mod.ts";
import { JengaSlideContent, jengaSlideContentDef } from "./jenga.ts";

const { h, useState, createContext, useContext, useEffect } = act;
const { useSelector, isArrayEqual } = actCommon;

const { useDocContext, Provider } = createDocContext(async () => {
  const world = simpleSystem.createMemoryWorld();
  const backend = createBackend(world);
  const { presentation } = backend;

  const artifactService = backend.artifact.createService("my_user")

  const dotsAsset = await artifactService.uploadAsset(
    "example-game",
    await (await fetch(dotsURL)).blob()
  );
  const paperAsset = await artifactService.uploadAsset(
    "example-game",
    await (await fetch(paperURL)).blob()
  );
  const streetAsset = await artifactService.uploadAsset(
    "example-game",
    await (await fetch(streetURL)).blob()
  );

  await presentation.slide.service.create({
    gameId: "example-game",
    name: "Cool Slide",
    content: {
      type: "title",
      title: "THIS IS A COOL SLIDE",
      background: {
        type: "image",
        assetId: streetAsset.id,
      },
    },
  });
  const gameController = {
    gameId: 'example-game',
    artifact: artifactService,
  }

  return { world, backend, gameController };
});

const PresentationSystemDemo = () => {
  const { world, backend, gameController } = useDocContext();

  const assetPart = world.partitions.get("artifact");
  console.log(world.partitions);

  if (!assetPart) return null;

  const uploadedAssets = useSelector(
    {
      retrieve: () => assetPart.memory(),
      changes: assetPart.onMemoryUpdate,
    },
    (data) => data,
    [],
    isArrayEqual
  ).map((i) => i.value) as artifact.Asset[];

  return h("div", {}, [
    h(artifact.UploadButton, {
      gameId: "example-game",
      artifact: gameController.artifact,
      accept: "image/*",
    }),
    h("ul",
      {},
      uploadedAssets.map((a) => h("li", {}, h("pre", {}, a.id)))
    ),
    h(SystemComponentsPreview, {
      systemDef: slideSystemDef,
      world,
      components:
        backend.presentation.slide as unknown as simpleSystem.Components<simpleSystem.SimpleSystemType>,
    }),
  ]);
};

const SlideDemo = () => {
  const { world, gameController } = useDocContext();

  const part = world.partitions.get("presentation/slide");
  if (!part) return null;

  const slides = useSelector(
    {
      retrieve: () => part.memory(),
      changes: part.onMemoryUpdate,
    },
    (data) => data,
    [],
    isArrayEqual
  ).map((i) => i.value) as Slide[];

  return [
    slides.map((slide) => {
      return h(FramePresenter, {}, [
        h(SlideRenderer, {
          slide,
          assets: gameController.artifact,
          gameId: gameController.gameId,
          gameController,
        }),
      ]);
    }),
  ];
};

//slideDef.properties.content as m.ModelOf2<Slide["content"]>

const EditableSlideDemo = () => {
  const { gameController } = useDocContext();
  const [slide, setSlide] = useState<Slide>({
    ...m.createDefaultValue<Slide>(slideDef),
    content: m.createDefaultValue<JengaSlideContent>(jengaSlideContentDef)
  });

  return [
    h(FramePresenter, {}, [
      h(SlideRenderer, {
        slide,
        gameId: gameController.gameId,
        assets: gameController.artifact,
        gameController,
      }),
    ]),
    h('h3', {}, 'Editor'),
    h(FramePresenter, {}, [
      h(ContentEditor, {
        gameController,
        content: slide.content,
        onContentChange: (content) => setSlide({ ...slide, content }),
      }),
    ]),
    h('h3', {}, 'Output'),
    h('pre', {}, JSON.stringify(slide, null, 2))
  ];
};

const demos = {
  EditableSlideDemo,
  PresentationSystemDemo,
  SlideDemo,
};

export const presentationDocs: DocSheet[] = [
  markdownToSheet("Presentation", readme, demos, Provider),
];
