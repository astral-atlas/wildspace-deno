import { act } from './deps.ts';

export const useAsync = <T>(task: () => Promise<T>, deps: act.Deps = []): [null | T, unknown] => {
  const [resolution, setResolution] = act.useState<T | null>(null);
  const [rejection, setRejection] = act.useState<unknown | null>(null);

  act.useEffect(() => {
    task()
      .then(setResolution, setRejection)
  }, deps);

  return [resolution, rejection];
}