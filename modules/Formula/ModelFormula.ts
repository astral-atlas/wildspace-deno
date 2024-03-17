import { LabelBlock } from "./LabelBlock.ts";
import { act, hash, m } from "./deps.ts";

const { h, useState } = act;

export type ModelFormulaProps = {
  model: m.Model;
  value: m.ModeledType;
  disabled?: boolean,
  onInput?: (value: m.ModeledType, event?: InputEvent) => unknown;
};

const isPrimitive = (model: m.Model): boolean => {
  switch (model.type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
    case 'never':
    case 'any':
    case 'literal':
    case 'enum':
      return true;
    case 'array':
    case 'object':
    case 'union':
    case 'union2':
      return false;
    case 'nullable':
      return isPrimitive(model.value);
    case 'meta':
      return isPrimitive(model.value);
    case 'dynamic':
      return isPrimitive(model.getModel());
  }
}

const style = {
  object: {
  },
  objectProperties: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    paddingLeft: '16px'
  },
  objectProperty: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  input: {
    padding: '4px',
    marginLeft: '4px'
  },
  syntax: {
    margin: 0
  }
};

export const ModelFormula: act.Component<ModelFormulaProps> = ({
  model,
  value,
  disabled,
  onInput = (_) => {},
}) => {
  switch (model.type) {
    case "literal":
      return h("pre", { style: { display: 'inline' } }, `${model.value}`);
    case "string": {
      const stringValue = m.castString(value);
      const onTextInput = (e: InputEvent) => {
        const element = e.target as HTMLInputElement;
        onInput(element.value, e);
      };
      return h("input", {
        disabled,
        style: style.input,
        type: "text",
        onInput: onTextInput,
        value: stringValue,
      });
    }
    case "number": {
      const numberValue = m.castNumber(value);
      const onNumberInput = (e: InputEvent) => {
        const element = e.target as HTMLInputElement;
        onInput(element.valueAsNumber, e);
      };
      return h("input", {
        type: "number",
        disabled,
        onInput: onNumberInput,
        value: numberValue,
      });
    }
    case "object": {
      const objectValue = m.castObject(value);
      const properties = h("ol", { style: style.objectProperties },
        Object.entries(model.properties).map(([name, propertyModel]) => {
          const value = objectValue[name];

          const onPropertyInput = (
            nextValue: m.ModeledType,
            event?: InputEvent,
          ) => {
            const nextObject = {
              ...objectValue,
              [name]: nextValue,
            };
            onInput(nextObject, event);
          };

          if (!isPrimitive(propertyModel)) {
            return h("li", { style: style.objectProperty }, [
              h('div', {}, name),
              h(ModelFormula, {
                model: propertyModel,
                value,
                disabled,
                onInput: onPropertyInput,
              })
            ])
          }

          return h("li", { style: style.objectProperty }, h('label',
              { text: `${name}:`, inline: true },
              h(ModelFormula, {
                model: propertyModel,
                value,
                disabled,
                onInput: onPropertyInput,
              }),
            ),
          );
        }),
      );
      const hue = hash.fastHashCode(JSON.stringify(model)) % 360;
      const backgroundColor = `hsl(${hue}deg, 40%, 80%)`
      return h('div', { style: { backgroundColor }}, [
        h('pre', { style: style.syntax }, '{'),
        properties,
        h('pre', { style: style.syntax }, '}'),
      ])
    }
    case "enum": {
      const castEnum = m.createEnumCaster(model.cases);
      const enumValue = castEnum(value);

      const onEnumInput = (e: InputEvent) => {
        const element = e.target as HTMLSelectElement;
        onInput(element.value, e);
      };

      return h(
        "select",
        { onInput: onEnumInput, disabled, },
        model.cases.map((enumCase) => {
          return h("option", { selected: enumValue === enumCase }, enumCase);
        }),
      );
    }
    case 'union2':
      return h(UnionModelFormula, { model, value, onInput, disabled });
    case 'nullable':
      return h(NullableModelFormula, {  model, value, onInput, disabled })
    case 'meta':
      return h(ModelFormula, {
        model: model.value,
        value,
        disabled,
        onInput: onInput,
      });
    default:
      return h("pre", { style: { display: 'inline' } }, `Unsupported Model Type (${model.type})`);
  }
};

type ModelFormulaRefinedProps<TModelType> = {
  model: TModelType;
  value: m.ModeledType;
  disabled?: boolean,
  onInput?: (value: m.ModeledType, event?: InputEvent) => unknown;
};

const UnionModelFormula: act.Component<
  ModelFormulaRefinedProps<m.ModelsByType["union2"]>
> = ({
  model,
  value,
  disabled,
  onInput = _ => {}
}) => {
  const caseValues = model.cases.map(modelCase => {
    try {
      return m.createModelCaster(modelCase)(value);
    } catch {
      return m.createDefaultValue<m.ModeledType>(modelCase)
    }
  });
  const selectedCase = model.cases.find(modelCase => {
    try {
      m.createModelCaster(modelCase)(value);
      return true;
    } catch {
      return false
    }
  })
  const onPickCaseClick = (modelCaseIndex: number) => () => {
    onInput(caseValues[modelCaseIndex])
  }

  return model.cases.map((modelCase, modelCaseIndex) => {
    return h('div', { style: { display: 'flex' }}, [
      h('button', {
        disabled: disabled || (modelCase === selectedCase),
        type: 'button',
        onClick: onPickCaseClick(modelCaseIndex)
      }, 'Pick'),
      h('div', { style: { flex: 1 } }, [
        h(ModelFormula, {
          disabled: disabled || (modelCase !== selectedCase),
          model: modelCase,
          value: caseValues[modelCaseIndex],
          onInput,
        }),
      ]),
    ])
  })
}

const NullableModelFormula: act.Component<
  ModelFormulaRefinedProps<m.ModelsByType["nullable"]>
> = ({
  model,
  value,
  onInput = _ => {},
  disabled,
}) => {
  const onNullClick = () => {
    onInput(value === null ? m.createDefaultValue<m.ModeledType>(model.value) : null);
  }

  return [
    h('button', {
      onClick: onNullClick,
    }, 'Toggle Null'),
    h('div', { style: { flex: 1 } }, [
      value === null && h('pre', { style: style.syntax }, 'null'),
      value !== null && h(ModelFormula, {
        disabled: disabled,
        model: model.value,
        value,
        onInput,
      }),
    ]),
  ]
}