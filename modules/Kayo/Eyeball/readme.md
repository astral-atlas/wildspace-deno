# Eyeball

::EngineDemo

::DropdownCandidateDemo

Eyeball is the kayo engine for displaying dialogues, overlays, dropdowns
and tooltips.

## Demo

::EyeballDemo

## Eyeball Socket

The "Socket" is the entry point for the eyeball system - all content within the
socket is called the "regular content" or "main content". It provides access to the
eyeball API via the act context (or you can pass in an instance of the eyeball engine).

All other elements appear "above" the main content, but are constrained to the socket - 
thus when selecting where to place the socket in component heirarchy, you should place it
in such a way where it can take up most (or all) of the screen.

### Socket Space

Most elements inside a eyeball socket are described by their "socket space" - the socket's
element occupes a rect

## Dialogue

A Dialogue is an element/component that takes over the regular content of the page,
typically with a small interactable component that appears in order to perform some
function on the main content. Some examples of dialogues are:
  - The Game Item picker
  - A join or close confirmation box
  - An event popup

Dialogues keep the main content visible, but uninteractable. There are **"optional"**
dialogues, where the dialogue can be closed by a X button or by clicking on the main content
(which is obscured by a **"curtain"**), and **"required"** dialogues which cannot be dismissed
via interaction with default UI elements - something else must close the dialogue.

## Tooltip

A Popover is an element/component that supplements content on a page by presenting
additional content above the main content, contextually adjacent to an element of the main
content.

A tooltip has a "Tooltip Provider", an anchor element that a tooltip is positioned around (above,
below, beside) based on the tooltip's **"position preference"**, and the available space in the socket. 

There can be multiple toolips on a page at once - a tooltip activetes "passivley", often by either focusing
on the element, or by simply hovering over it. Hovering over a tooltip is considered to be the same as hovering
over it's anchor element. If a tooltip itself contains a tooltip, then a "child" tooltip can be spawned.

## Dropdown

A Dropdown is an element/component that provides additional actions to content on a page
by presenting a menu above the main content. In a mix between a dialogue and a tooltip, it
does not take over content, and can be quickly dismissed by clicking on the **"curtain"**, and
navigated "passivley".

A dropdown has a "Dropdown Provider", an anchor element that the tooltip is positioned around - either
"within" or "around". Dropdowns can also be created without an anchor element - floating in place.

### Candidate Positions

## Curtain

The "Curtain" is an element that appears behind certain Eyeball components, but above the main content. It's
purpose is to intercept interactions that would go to the main content, and trigger actions (such as closing a
dropdown) instead. A curtain also provides visual feedback that the previous content is no longer visible (by blurring/
proving a dark-but-transparent overlay)