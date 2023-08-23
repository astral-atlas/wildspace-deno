import { Component, ElementNode, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

// @deno-types="vite-css" 
import styles from './BigTable.module.css';

export type BigTableProps = {
  columns:  string[],
  rows:     string[][],
  heading?:  ElementNode,
};

export const BigTable: Component<BigTableProps> = ({ columns, rows, heading }) => {
  return h('div', { class: styles.bigTableContainer }, h('table', { class: styles.bigTable }, [
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