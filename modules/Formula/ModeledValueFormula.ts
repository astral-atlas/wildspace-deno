import { m, act } from "./deps.ts";

type DefinedValue<T extends m.ModeledType> = {
  definition: m.ModelOf2<T>,
  value: T,
}

export type ModeledValueFormulaProps = {
  value: DefinedValue<m.ModeledType>,
};

export const ModeledValueFormula: act.Component<ModeledValueFormulaProps> = ({ value }) => {
  return null
};


act.h(ModeledValueFormula, {
  value: {
    definition: m.string,
    value: 10,
  }
})