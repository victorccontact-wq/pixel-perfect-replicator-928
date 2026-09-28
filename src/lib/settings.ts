export const SETTINGS_KEY = "myo_settings";

export type Settings = {
  sound: boolean;
  haptics: boolean;
  autoRestDelay: number;
};

export const DEFAULTS: Settings = { sound: true, haptics: true, autoRestDelay: 5 };

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
