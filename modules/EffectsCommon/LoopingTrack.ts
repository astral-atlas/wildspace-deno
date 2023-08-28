import { act, actThree, schedule, three } from "./deps.ts";
const { h, useState, useEffect, useRef } = act;

export type LoopingTrackProps = {
  renderContent: (distance: number) => act.ElementNode,
  period?: number,
  size?: number,
  count?: number,
};

export const LoopingTrack: act.Component<LoopingTrackProps> = ({
  renderContent,
  period = 1000,
  size = 1,
  count = 4,
}) => {
  const [distance, setDistance] = useState(0);
  const startTime = useRef(performance.now()).current;

  const [distances, setDistances] = useState([]);
  
  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const distance = Math.floor((now - startTime) / period);
      setDistance(distance);
    }, period)
    return () => clearInterval(id);
  }, []);

  return Array.from({ length: count })
    .map((_, index) => h(LoopContainer, {
      period,
      key: Math.round(index + distance).toString(),
      distance: index + distance,
      startTime,
      size,
    },
      renderContent(index + distance)))
};

type LoopContainerProps = {
  size?: number,
  distance: number,
  period: number,
  startTime: number,
}

const LoopContainer: act.Component<LoopContainerProps> = ({
  distance,
  size = 1,
  period,
  startTime,
  children,
}) => {
  const ref = useRef<three.Group | null>(null);

  schedule.useAnimation(`LoopingTrack(${distance})`, ({ now }) => {
    if (!ref.current)
      return;
    const travelTime = now - startTime;
    ref.current.position.setX((distance + (-travelTime/period)) * -size);
  })

  return h('group', { ref }, children);
};