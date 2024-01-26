# Clerk

Clerk is the filesystem managment library for Wildspace.

Most items associated with a game can exist within the "FileSystem",
a tree of nodes that contains references to external resources.

## FileItem

A FileItem represents a single node in the FileSystem. They have a unique
Id, as well as having a FileContent object which defines what they contain.

Files have a "Name", which _should_ be kept in sync with the resource it
represents.

The filesystem is "double ended" - in the sense that each child has a reference
to it's parent, and each parent has a reference to it's child.

Any File that is inconsistent with either one of those references, or is missing both,
is considered an [**Orphan**](#orphan).

### Orphan

Orphans will be killed.

## File Browser

To view this filesystem, there is a File Browser component,
which when given the list of all files in a filesystem and a
"root file" (which must be a directory), renders it all out
using Kayo's Instinct Tree component.

::fileBrowserDemo

## Services

There are two direct backends that Clerk interacts with, but typically
clerk is used in conjunction with most of the Universe, since it needs
to check if any of the resources its referring to actually exist.

### Files

::filesService

### GameRoots

::rootService