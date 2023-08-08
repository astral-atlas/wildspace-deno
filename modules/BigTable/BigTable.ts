import { Component, h } from "https://esm.sh/@lukekaalim/act@2.6.0";

// @deno-types="vite-css" 
import styles from './BigTable.module.css';

export type BigTableProps = {
  columns:  string[],
  rows:     string[][],
};

export const BigTable: Component<BigTableProps> = ({ columns, rows }) => {
  return h('table', { class: styles.bigTable }, [
    h('thead', {}, h('tr', {}, columns.map(column =>
      h('th', {}, column)))),
    h('tbody', {}, rows.map(row =>
      h('tr', {}, row.map(cell =>
        h('td', {}, cell)))))
  ]);
}