import { act } from './deps.ts';
const { h } = act;

export type WildspaceFeatureDocProps = {
  name: string,
  path: string,
}

const styles = {
  cell: {
    border: '1px solid black',
    padding: '6px',
  },
  heading: {
    background: 'grey',
    color: 'white',
    border: '1px solid black',
    padding: '6px',
  },

  table: {
    borderCollapse: 'collapse',
    minWidth: '25%',
  }
}

export const WildspaceFeatureDoc: act.Component<WildspaceFeatureDocProps> = ({
  name,
  path,
}) => {
  return h('table', { style: styles.table }, [
    h('thead', {}, [
      h('tr', {}, h('th', { colspan: "2", style: styles.cell }, [
        'Feature'
      ])),
    ]),
    h('tbody', {}, [
      h('tr', {}, [
        h('th', { style: styles.heading }, h('strong', {}, 'Name')),
        h('td', { style: styles.cell }, name),
      ]),
      h('tr', {}, [
        h('th', { style: styles.heading }, h('strong', {}, 'Import')),
        h('td', { style: styles.cell }, h('pre', {}, `import {} from '${path}'`)),
      ]),
    ])
  ]);
};
