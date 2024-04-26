import { act } from "./deps";

export type EventRecordState = {
  eventsByType: Map<string, unknown[]>,
  submitNewEvent: (type: string, event: unknown) => void,
};

const eventRecordContext = act.createContext<EventRecordState | null>(null);

export const EventRecordProvider: act.Component = ({ children }) => {
  const [eventsByType, setEventsByType] = act.useState(new Map());

  const recordState: EventRecordState = {
    eventsByType,
    submitNewEvent(type, event) {
      setEventsByType(prev => {
        const next = new Map(prev);
        next.set(type, [...(prev.get(type) || []), event]);
        return next;
      })
    },
  }

  const ctx = act.useContext(eventRecordContext);

  return act.h(eventRecordContext.Provider, { value: ctx || recordState }, children);
};

export type EventRecord<T> = {
  submit: (event: T) => void,
  list: T[],
}

export const useEventRecord = <T>(type: string): EventRecord<T> => {
  const ctx = act.useContext(eventRecordContext);
  if (!ctx)
    throw new Error();

  const list = (ctx.eventsByType.get(type) || []) as T[];

  return {
    submit(event) {
      ctx.submitNewEvent(type, event);
    },
    list
  }
};

export const useRecordedEventTypes = (): string[] => {
  const ctx = act.useContext(eventRecordContext);
  if (!ctx)
    throw new Error();
  return [...ctx.eventsByType.keys()];
}

export type EventListProps = {
  renderEvent: Record<string, <T>(event: T) => act.ElementNode>,
}

export const EventList: act.Component<EventListProps> = ({ renderEvent }) => {
  const [selectedType, setSelectedType] = act.useState<string | null>(null);
  const allTypes = useRecordedEventTypes();

  const selectedEvents = useEventRecord(selectedType || allTypes[0]);

  return [
    allTypes.length > 1 &&
      act.h('ul', {}, allTypes.map(type =>
        act.h('li', {},
          act.h('button', { onClick: () => setSelectedType(type) }, type)))),
    act.h('ol', {}, selectedEvents.list.map(event => {
      return act.h('li', {}, renderEvent[selectedType || allTypes[0]](event));
    }))
  ]
}
