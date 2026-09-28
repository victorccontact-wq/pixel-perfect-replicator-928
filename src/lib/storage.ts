export type Exercise = {
  id: string;
  name: string;
  sets: number;
  load: number;
  rest: number;
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: number;
};

const KEY = "myo.workouts.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function loadWorkouts(): Workout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Workout[]) : [];
  } catch {
    return [];
  }
}

export function saveWorkouts(list: Workout[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function getWorkout(id: string): Workout | undefined {
  return loadWorkouts().find((w) => w.id === id);
}

export function upsertWorkout(w: Workout) {
  const list = loadWorkouts();
  const i = list.findIndex((x) => x.id === w.id);
  if (i === -1) list.unshift(w);
  else list[i] = w;
  saveWorkouts(list);
}

export function deleteWorkout(id: string) {
  saveWorkouts(loadWorkouts().filter((w) => w.id !== id));
}

export function emptyWorkout(): Workout {
  return { id: uid(), name: "", exercises: [], createdAt: Date.now() };
}
