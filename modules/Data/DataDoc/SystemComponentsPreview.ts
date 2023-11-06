import { StoreVisualzer } from "./mod.ts";
import { act, actCommon, formula, m, simpleSystem } from "./deps.ts";

const { h, useState, useMemo } = act;
const { useSelector, isArrayEqual } = actCommon;

export type SystemComponentsPreviewProps = {
  systemDef: simpleSystem.SimpleSystemDefinition<simpleSystem.SimpleSystemType>,
  world: simpleSystem.MemoryWorld,
  components: simpleSystem.Components<simpleSystem.SimpleSystemType>,
}

const actions = [
  'create',
  'read',
  'update',
  'delete',
  'list',
] as const

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
  
  const keyModel = m.object({
    [systemDef.names.partition]: m.string,
    [systemDef.names.sort]: m.string,
  })
  const [target, setTarget] = useState(
    m.createDefaultValue<m.OfModelType<typeof readModel>>(readModel)
  );

  return [
    h(ServiceForm, {
      service: components.service,
      systemDef,
    }),
    h('hr'),
    h(StoreVisualzer, { store, name: systemDef.key })
  ];
};

export type TargetResourceProps = {
  keyModel: m.Model,
  key: m.ModeledType,
  onKeyChange: (target: m.ModeledType) => unknown,
}

const ResourceKey: act.Component<TargetResourceProps> = ({
  keyModel,
  key,
  onKeyChange,
}) => {
  return h(formula.ModelFormula, {
    model: keyModel,
    value: key,
    onInput: v => onKeyChange(v),
  });
}

type ServiceFormProps = {
  service: simpleSystem.Service<simpleSystem.SimpleSystemType>,
  systemDef: simpleSystem.SimpleSystemDefinition<simpleSystem.SimpleSystemType>,
}

const ServiceForm: act.Component<ServiceFormProps> = ({
  systemDef,
  service,
}) => {
  const [action, setAction] = useState<typeof actions[number]>(actions[0]);
  const keyModel = m.object({
    [systemDef.names.partition]: m.string,
    [systemDef.names.sort]: m.string,
  })
  const [key, setKey] = useState(
    m.createDefaultValue<m.OfModelType<typeof keyModel>>(keyModel)
  );
  const castKey = m.createModelCaster(keyModel)
  const [output, setOutput] = useState<m.ModeledType>(null);

  const actionFormProps = { systemDef, service, key, setOutput };
  const onInputAction = (e: InputEvent) => {
    const select = e.target as HTMLSelectElement;
    setAction(select.value as (typeof actions)[number])
  }

  const renderAction = () => {
    switch (action) {
      case 'create':
        return h(CreateActionForm, actionFormProps)
      case 'read':
        return h(ReadActionForm, actionFormProps)
      case 'update':
        return h(UpdateActionForm, actionFormProps);
      case 'delete':
        return h(DeleteActionForm, actionFormProps)
      case 'list':
        return h(ListActionForm, actionFormProps)
      default:
        return 'WIP';
    }
  }
  return h('details', {}, [
    h('summary', {}, 'Service Actions'),
    h('h4', {}, 'Key'),
    h('form', { style: styles.keyContainer },
      h(ResourceKey, { key, keyModel, onKeyChange: k => setKey(castKey(k)) }),
    ),
    h('h4', {}, 'Action'),
    h('select', { onInput: onInputAction }, actions
      .map(a => h('option', { selected: a === action }, a))),
    renderAction(),
    h('h4', {}, 'Output'),
    h('pre', { style: styles.outputContainer }, JSON.stringify(output, null, 2)),
  ])
};

type ActionFormProps = {
  key: Record<string, string>,
  setOutput: (output: m.ModeledType) => unknown, 
  service: simpleSystem.Service<simpleSystem.SimpleSystemType>,
  systemDef: simpleSystem.SimpleSystemDefinition<simpleSystem.SimpleSystemType>,
}

const styles = {
  formContainer: {
    margin: '8px',
    padding: '8px',
    backgroundColor: '#cfd9e1',
    borderRadius: '4px'
  },
  keyContainer: {
    margin: '8px',
    padding: '8px',
    backgroundColor: 'rgb(242, 145, 123)',
    borderRadius: '4px'
  },
  outputContainer: {
    margin: '8px',
    padding: '8px',
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '4px'
  }
}

const CreateActionForm: act.Component<ActionFormProps> = ({
  service,
  systemDef,
  setOutput,
}) => {
  const [value, setValue] = useState(
    m.createDefaultValue<m.ModeledType>(systemDef.models.create)
  );
  
  return h('form', { style: styles.formContainer, onSubmit(e: SubmitEvent) {
    e.preventDefault()
    service.create(value)
      .then(setOutput)
      .catch(() => setOutput(null))
  } }, [
    h(formula.ModelFormula, {
      model: systemDef.models.create,
      value,
      onInput: setValue,
    }),
    h('pre', {}, JSON.stringify(value, null, 2)),
    h('button', { type: 'submit' }, "Create"),
  ])
};

const ReadActionForm: act.Component<ActionFormProps> = ({
  service,
  systemDef,
  setOutput,
  key,
}) => {
  return h('form', { style: styles.formContainer, onSubmit(e: SubmitEvent) {
    e.preventDefault()
    service.read(key)
      .then(setOutput)
      .catch(() => setOutput(null))
  } }, [
    h('button', { type: 'submit' }, "Read"),
  ])
};

const UpdateActionForm: act.Component<ActionFormProps> = ({
  service,
  systemDef,
  setOutput,
  key,
}) => {
  const [value, setValue] = useState(
    m.createDefaultValue<m.ModeledType>(systemDef.models.update)
  );

  return h('form', { style: styles.formContainer, onSubmit(e: SubmitEvent) {
    e.preventDefault()
    service.update(key, value)
      .then(setOutput)
      .catch(() => setOutput(null))
  } }, [
    h(formula.ModelFormula, {
      model: systemDef.models.update,
      value,
      onInput: setValue,
    }),
    h('pre', {}, JSON.stringify(value, null, 2)),
    h('button', { type: 'submit' }, "Update"),
  ])
};

const DeleteActionForm: act.Component<ActionFormProps> = ({
  service,
  systemDef,
  setOutput,
  key,
}) => {
  return h('form', { style: styles.formContainer, onSubmit(e: SubmitEvent) {
    e.preventDefault()
    service.delete(key)
      .then(setOutput)
      .catch(() => setOutput(null))
  } }, [
    h('button', { type: 'submit' }, "Delete"),
  ])
};

const ListActionForm: act.Component<ActionFormProps> = ({
  service,
  systemDef,
  setOutput,
  key,
}) => {
  return h('form', { style: styles.formContainer, onSubmit(e: SubmitEvent) {
    e.preventDefault()
    service.list(key)
      .then(setOutput)
      .catch(() => setOutput(null))
  } }, [
    h('button', { type: 'submit' }, "List"),
  ])
};