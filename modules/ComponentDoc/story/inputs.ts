import { act, nanoid } from '../deps';

export type StoryInput<T> = {
  renderControl: (current: T, next: (value: T) => void) => act.ElementNode,
  value: T,
  id: string,
};

export const useInputStoryManager = () => {
  const [inputs, setInputs] = act.useState<Map<string, StoryInput<unknown>>>(new Map());

  const useStoryInput = <T>(renderControl: StoryInput<T>["renderControl"], initialValue: T): T => {
    const [id] = act.useState(nanoid());

    act.useEffect(() => {
      const newInput = {
        id,
        value: initialValue,
        renderControl
      } as StoryInput<unknown>;
      setInputs(ins => new Map([...ins, [newInput.id, newInput]]))
    }, [])

    const currentInput = inputs.get(id) as StoryInput<T>;

    return currentInput ? currentInput.value : initialValue;
  };

  const renderInputs = () => {
    return [...inputs.values()].map(input => {
      const next = (value: unknown) => {
        setInputs(ins => {
          const prev = ins.get(input.id);
          if (!prev)
            throw new Error('Calling Next on nonexistant Input');
          return new Map([...ins, [input.id, { ...prev, value }]]);
        })
      }
      return input.renderControl(input.value, next)
    })
  };

  return {
    useStoryInput,
    renderInputs,
  }
};
