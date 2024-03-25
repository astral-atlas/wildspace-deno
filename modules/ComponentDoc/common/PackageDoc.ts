import { act } from "../deps";

const { h } = act;

export type PackageDocProps = {
  pkg: {
    name?: string,
    version?: string,
    dependencies?: Record<string, string>,
  }
}

export const PackageDoc: act.Component<PackageDocProps> = ({ pkg }) => {
  return [
    h('table', {}, [
      !!pkg.name && h('tr', {}, [
        h('th', {}, 'Name'),
        h('td', {}, pkg.name),
      ]),
      !!pkg.version && h('tr', {}, [
        h('th', {}, 'Version'),
        h('td', {}, pkg.version),
      ]),
    ]),
    !!pkg.dependencies && h('table', {}, [
      h('tr', {}, [
        h('th', {}, 'Dependency'),
        h('th', {}, 'Version'),
      ]),
      Object.entries(pkg.dependencies)
        .map(([name, version]) => h('tr', {}, [
          h('td', {}, name),
          h('td', {}, version),
        ]))
    ]),
  ]
}