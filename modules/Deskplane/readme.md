# DeskPlane

This component library covers components
around a "Deskplane" - a component that offers
a window into a infinite 2d plane.

## useDraggableSurface2

This basic component captures some input events
for a particular Element on a page, and can
report the `start -> end` of a particular dragging
sequence.

::DraggableSurface2Demo

## Deskplane

Everything put together - a draggable surface,
a draggable element inside that surface, the background
grid moving to represent you changed position,
and an element on top, that does not trigger drag events.

::deskplane_demo

## GridSVG

::gridsvg_demo

## useDraggableSurface

::dragsurface_demo

## useDraggableParticle

Clicking and dragging on this surface will move
a [particle](./Particle) around, imparting momentum on mouseup

::dragparticle_demo