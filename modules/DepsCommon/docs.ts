import { doc, h } from "../ComponentDoc/mod.ts";
import pkg from './package.json';

/*
export * as hash from "fast-hash-code";
export * as rxjs from 'rxjs';
export * as _ from 'lodash-es';
export * as base64 from 'base64-arraybuffer'

export { default as immutable } from 'immutable';
export { default as color } from 'color';
export { default as random } from 'seedrandom';


export { nanoid } from 'nanoid';
*/
const depExportMap = {
  'fast-hash-code': 'hash',
  'rxjs': 'rxjs',
  'lodash-es': '_',
  'base64-arraybuffer': 'base64',
  'immutable': 'immutable',
  'color': 'color',
  'nanoid': 'nanoid',
  'seedrandom': 'random',
}

const buildNpmLink = (packageName: string) => {
  return `https://www.npmjs.com/package/${packageName}`
}

const deptable = () => {
  return h('table', {}, [
    h('thead', {}, h('tr', {}, [
      h('th', {}, 'Package'),
      h('th', {}, 'Version'),
      h('th', {}, 'Export As'),
    ])),
    Object.entries(pkg.dependencies).map(dep => {
      return h('tr', {}, [
        h('td', {}, h('a', { href: buildNpmLink(dep[0]) }, dep[0])),
        h('td', {}, dep[1]),
        h('td', {}, h('code', {}, depExportMap[dep[0]])),
      ])
    })
  ])
}

doc({
  readmeURL: new URL('./readme.md', import.meta.url),
  id: 'DepsCommon',
  directiveComponents: { deptable }
})