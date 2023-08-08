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

## DocElement

::docsite