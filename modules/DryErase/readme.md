# DryErase

DryErase is a module for a "white-board-like" experience,
letting you draw and mark a virtual space, in sync with
other users.

::demo

## Editor

::whiteboardEditorDemo

## Backend

::backendDemo

## Models

There are three types of content on a whiteboard:
 - Canvas
 - Sticker
 - Stroke

## Protocol
Connecting to a whiteboard is a live process - different
users will continue to modify the whiteboard in realtime.

To facilitate this, there is a protocol for communicating
changes to the whiteboard called the [Whiteboard Protocol](#protocol).

## Stroke

Movement of a brush across the whiteboard. When you lift your stroke,
it _may_ be baked into an existing canvas (or create a new one).

## Canvas

Canvas represents a 2D image. The canvas is a combination
of all previous strokes.

## Sticker

A sticker is a piece of external content, typically an image.
