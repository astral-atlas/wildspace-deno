import { Label } from "./Label.ts";
import { act, m } from "./deps.ts";

const { h } = act;

export type ModelFormulaProps = {
  model: m.Model;
  value: m.ModeledType;
  onInput?: (value: m.ModeledType, event?: InputEvent) => unknown;
};

const style = {
  object: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
};

export const ModelFormula: act.Component<ModelFormulaProps> = ({
  model,
  value,
  onInput = (_) => {},
}) => {
  switch (model.type) {
    case "literal":
      return h("pre", {}, `${model.value}`);
    case "string": {
      const stringValue = m.castString(value);
      const onTextInput = (e: InputEvent) => {
        const element = e.target as HTMLInputElement;
        onInput(element.value, e);
      };
      return h("input", {
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
        onInput: onNumberInput,
        value: numberValue,
      });
    }
    case "object": {
      const objectValue = m.castObject(value);
      return h("ol", { style: style.object },
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

          return h("li", {}, h(
              Label,
              { text: name },
              h(ModelFormula, {
                model: propertyModel,
                value,
                onInput: onPropertyInput,
              }),
            ),
          );
        }),
      );
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
        { onInput: onEnumInput },
        model.cases.map((enumCase) => {
          return h("option", { selected: enumValue === enumCase }, enumCase);
        }),
      );
    }
    default:
      return h("pre", {}, `Unsupported Model Type (${model.type})`);
  }
};
