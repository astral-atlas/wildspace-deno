import { StoreVisualzer } from "../../DataDoc/mod.ts";
import { act, actCommon, formula, m, simpleSystem } from "./deps.ts";

const { h, useState, useMemo } = act;
const { useSelector, isArrayEqual } = actCommon;

export type SystemComponentsPreviewProps = {
  systemDef: simpleSystem.SimpleSystemDefinition<simpleSystem.SimpleSystemType>,
  world: simpleSystem.MemoryWorld,
  components: simpleSystem.Components<simpleSystem.SimpleSystemType>,
}

export const SystemComponentsPreview: act.Component<SystemComponentsPreviewProps> = ({
  systemDef,
  world,
  components
}) => {
  const store = world.partitions.get(systemDef.key);
  if (!store)
    return 'Store not found';

  const [value, setValue] = useState(
    m.createDefaultValue<m.ModeledType>(systemDef.models.create)
  );
  const [selectedValueIndex, setSelectedValueIndex] = useState(0);
  const [updateValue, setUpdate] = useState(
    m.createDefaultValue<m.ModeledType>(systemDef.models.update)
  );

  const source = useMemo(() => ({
    retrieve: () => store.memory(),
    changes: store.onMemoryUpdate
  }), [store])

  const items = useSelector(
    source,
    s => s,
    [],
    isArrayEqual);
  const selectedItem = items[selectedValueIndex]

  const [readResult, setReadResult] = useState<m.ModeledType>(null);
  const readModel = m.object({
    [systemDef.names.partition]: m.string,
    [systemDef.names.sort]: m.string,
  })
  const castReadModel = m.createModelCaster(readModel)
  const [readTarget, setReadTarget] = useState(
    m.createDefaultValue<m.OfModelType<typeof readModel>>(readModel)
  );

  return [
    h('div', { style: { display: 'flex', flexDirection: 'row', overflow: 'auto' } }, [
      h('div', { style: { width: '200px' } }, [
        h('button', { async onClick() {
          setReadResult(
            await components.service.read(readTarget)
          );
        }}, "Read"),
        h(formula.ModelFormula, {
          model: readModel,
          value: readTarget,
          onInput: v => setReadTarget(castReadModel(v)),
        }),
        h('pre', {}, JSON.stringify(readResult, null, 2)),
      ]),
      h('div', { style: { width: '200px' } }, [
        h('button', { onclick() {
          components.service.create(value);
        }}, "Create"),
        h(formula.ModelFormula, {
          model: systemDef.models.create,
          value,
          onInput: setValue,
        }),
      ]),
      h('div', {}, [
        h('select', { style: { width: '100%' }, onInput: (e: InputEvent) => {
          const select = e.target as HTMLSelectElement;
          setSelectedValueIndex(Number.parseInt(select.value));
        } }, items.map((item, index) =>
          h('option', { selected: item.key === selectedItem.key, value: index },
            item.key.part + ':' + item.key.sort))),
        h('div', { style: { display: 'flex', flexDirection: 'row' } }, [
          h('div', { style: { width: '200px' } }, [
            h('button', { onClick() {
              const key = {
                [systemDef.names.partition]: selectedItem.key.part,
                [systemDef.names.sort]: selectedItem.key.sort,
              }
              components.service.update(key, updateValue);
            } }, "Update"),
            h(formula.ModelFormula, {
              model: systemDef.models.update,
              value: updateValue,
              onInput: setUpdate
            }),
          ]),
          h('div', { style: { width: '200px' } }, [
            h('button', { onClick() {
              const key = {
                [systemDef.names.partition]: selectedItem.key.part,
                [systemDef.names.sort]: selectedItem.key.sort,
              }
              components.service.delete(key);
            } }, "Delete"),
          ]),
        ]),
      ]),
    ]),
    h(StoreVisualzer, { store, name: systemDef.key })
  ];
};
