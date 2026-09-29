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
const HISTORY_KEY = "myo.history.v1";

export type CompletedSet = {
  exerciseId: string;
  exerciseName: string;
  load: number;
  completedAt: number;
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: number;
  completedAt?: number;
  sets: CompletedSet[];
};

export function loadSessions(): WorkoutSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as WorkoutSession[] : [];
  } catch {
    return [];
  }
}

export function saveSession(session: WorkoutSession) {
  if (typeof window === "undefined") return;
  const sessions = loadSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index === -1) sessions.unshift(session);
  else sessions[index] = session;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
}

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
