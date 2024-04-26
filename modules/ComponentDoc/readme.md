# ComponentDoc

Component doc is a set of components that
you can use to build documentation.

Typically, you start with a markdown
file (like this one), and enhance it with
[Directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444).

Then, you have a `docs.ts` file that imports
the markdown, declares a component for each type
of Directive you wanted, and exports it.

Finally, at the root of your application or 
docs page you create a DocSite component, which
imports all the docs you made, and displays the UI.

## DocSite2

DocSite2 is the continuation of DocSite, with sidebar-based
navigation as well as a heiarchy view.

::DocSite2Demo

## FramePresenter

A "Frame Presenter" creates a frame on the screen, and displays
some other content inside it - allowing you to put demos or isolated
components inside this space to view them under different settings.

::frame_presenter_demo

## DocSite {#docsite}

> This is a legacy component

The DocSite component contains a navigation component
for routing around the page (which can be overriden)

::docsite
