# Changelog

#### 5th March, 2024

I don't want to talk about it.

Here's sanctum:

![](./sanctum-demo.png)

Take a look at it on the [clerk page](/Universe/Clerk#sanctum).

  - Added Sanctum
  - Added useFileSystem
  - Added Wizard
  - Added Asset Wizard

More wizardry to come.

#### 5th Feburary, 2024

Happy new year! Very belated. I've been working, just not committing.

Out of shame.

Who even knows what changed, but here is some bits:

  - Journal System upgrades
  - Universe
  - DocSite2
    - Now with child articles!
  - [Clerk](./Clerk)

Work in progress:
  - End-to-End experience
  - Finishing Clerk editors (scribe?)

#### 7th November, 2023
- Added touch support for DraggableSurface2
  - Should mean phone + tablet touch events
  will move the camera/workspace consistently
  - We only pay attention to the "first touch"
  so multi-touch actions are still WIP
- Added ResizeRect for usage in DryErase
  and Presentation

#### 22nd October, 2023
- Added ActCommon for some super-basic shared hooks:
  - `useAsync`. The classic
  - `useUpdatingMutableValue`. Handy render-time updating ref (generic version of useEventEffect)
  - `useSelector`. New hero of the day, calculates a slice of state out of a mutable object
  based off an event emitter and a comparison function. Makes it easy to sync some, but not all
  parts of an object to a render cycle.
- Started splitting out WhiteboardEditor into smaller components

#### 27rd September, 2023
- Man who even knows anymore
- Second pass at sesame page, now inside DoorJourney
- Janitor!
- More structured attempt at Models
- Whiteboard, Artifact, and NetworkService (and MemoryInternet)

#### 29rd August, 2023
- Added [SesamePage](./Sesame) and first pass of glitch mess
- Added Resource Set for ThreeCommon
- Updated FramePresenter to contain fullscreen button

#### 23rd August, 2023
- Starting from scratch again baby!
  This time in deno to get a breath of fresh air.
  Typescript now instead of flow as well, since it's become
  more advanced since I last checked.
- Keeping the old changelog tho.
- Removed **everything**
- Changed repo (this is now wildspace-deno, probably going to rename again soon!)
- Added `FrameScheduler`
- Added `ComponentDoc` (the site you are reading!)
- Added `ThreeCommonDoc`

- Added `EffectsCommon`
- Added `BoxParticle`

- Added `Deskplane`, `SVG`, `DraggableSurface`
- Added `Keyboard`
- Added `BigTable`

- Added [`SesameModels`](./SesameModels)
- Added `SesameDataService`
- Added `Formula`
- Added `Authentication`

#### 20th March, 2023
- Added `TagBoxTreeColumn`
- Added `TerrainPropEditor`

#### 15th March, 2023
- Added `TagRowInput`
- Added `DropdownLayout` (and friends)
- Added tag support to
  - `ResourceChip`
  - `ModelResourceEditorSection`

#### 13th March, 2023
- Added `GunTurret` test model
- Fixed `Resource Model Editor` not rendering non-mesh children

#### 11th March, 2023
- Added `ResourceChip` (and friends)
- Added `GameWindowOverlayLayout` (and friends)

#### 1st March, 2023
- Added `Preview Sidebar Layout`
- Added `Fill Block`
- Added `Frame Presenter`
- Added `Resource Model Editor`
- Added `Preview Sidebar Layout`

#### 26th Feb, 2023
- Updated documentation site to use `@lukekaalim/act-rehersal@2.5.0`
- Started new documentation layout in hopes of refactoring components
  library to be more structured
- Started changelog anew!