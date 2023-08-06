# FrameScheduler

This module helps coordinate callback functions
that should run at set intervals - such as
per frame or per "simulation tick", inside an
act context.

## Events

Each callback function is provided an event,
either a AnimationFrame or SimulationTick.

## Animation

An "animation frame" occurs at a variable rate
depending on how much processing time is available.

## Simulation

A "simulation tick" occurs at a fixed rate, and aways
represents the same advancement in the simulation (there
are no "delta ticks" representing half steps).

By default there are 5 ticks per second.

## FrameSchedulerEmitter

The FrameScheduler API includes a special emitter implementation
that accepts a "key". This can be used to track the
total amount of time spent in each callback function.
