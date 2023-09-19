import { Component, ElementNode, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

// @deno-types="vite-css" 
import styles from './BigTable.module.css';

export type BigTableProps = {
  columns:  string[],
  rows:     string[][],
  heading?:  ElementNode,
  containerStyle?:   { [style: string]: unknown },
  style?:   { [style: string]: unknown }
};

export const BigTable: Component<BigTableProps> = ({ columns, rows, heading, style, containerStyle }) => {
  return h('div', { class: styles.bigTableContainer, style: containerStyle }, h('table', { class: styles.bigTable, style }, [
    h('thead', {}, [
      h('tr', { colSpan: columns.length }, heading),
      h('tr', {}, columns.map(column =>
        h('th', {}, column)))
      ]),
    h('tbody', {}, rows.map(row =>
      h('tr', {}, row.map(cell =>
        h('td', {}, cell)))))
  ]));
}