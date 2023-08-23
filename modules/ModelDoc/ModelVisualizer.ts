import { act, models } from "./deps.ts";
const { h } = act;

export type ModelVisualizerProps = {
  model: models.Model;
};

export const ModelVisualizer: act.Component<ModelVisualizerProps> = ({
  model,
}) => {
  return h("pre", { style: { lineHeight: "24px" } }, h(ModelPart, { model }));
};

const Keyword: act.Component = ({ children }) => {
  return h(
    "span",
    {
      style: {
        backgroundColor: `#fdfcae`,
        padding: "2px",
        borderRadius: "2px",
        fontWeight: "bold",
      },
    },
    children
  );
};
const Literal: act.Component = ({ children }) => {
  return h(
    "span",
    {
      style: {
        color: "white",
        backgroundColor: `hsl(${Math.random() * 260}deg, 60%, 40%)`,
        padding: "2px",
        borderRadius: "2px",
      },
    },
    ['"', children, '"']
  );
};

const ModelPart: act.Component<{ model: models.Model }> = ({ model }) => {
  switch (model.type) {
    case "string":
      return h(Keyword, {}, "string");
    case "literal":
      return h(Literal, {}, model.value?.toString() || "null");
    case "object":
      return h(
        "div",
        {
          style: {
            backgroundColor: `hsl(${Math.random() * 260}deg, 30%, 85%)`,
            padding: "8px",
            borderRadius: "16px",
          },
        },
        [
          "{\n",
          Object.entries(model.properties).map(([name, value]) => [
            "  ",
            name,
            ": ",
            h(ModelPart, { model: value }),
            ",\n",
          ]),
          "}",
        ]
      );
    case "enum":
      return model.cases.map((enumCase, index) => [
        index !== 0 && " | ",
        h(Literal, {}, enumCase),
      ]);
    case "union":
      return h("div",
        {
          style: {
            backgroundColor: `hsl(${Math.random() * 260}deg, 70%, 85%)`,
            padding: "8px",
            borderRadius: "16px",
            display: 'flex',
            flexDirection: 'column',
          },
        },
        [
          Object.values(model.cases).map((unionCase, index) => [
            index !== 0 && h('span', {}, "or "),
            h(ModelPart, { model: unionCase }),
            "\n",
          ]),
        ]
      );
    default:
      return "???";
  }
};
