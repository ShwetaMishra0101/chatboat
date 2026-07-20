export interface Theme {
  id: string;
  label: string;
  accent: string; // preview swatch color
  bg: string; // preview background color
}

export const THEMES: Theme[] = [
  { id: "light", label: "Light", accent: "#dc2f3c", bg: "#f4f5f7" },
  { id: "dark", label: "Dark", accent: "#dc2f3c", bg: "#0f1117" },
  { id: "ocean", label: "Ocean", accent: "#2563eb", bg: "#eef2f9" },
  { id: "emerald", label: "Emerald", accent: "#059669", bg: "#eef6f2" },
  { id: "purple", label: "Purple", accent: "#6a5cff", bg: "#f3f2fb" },
  { id: "midnight", label: "Midnight", accent: "#8b5cf6", bg: "#0f0d1a" },
];

const STORAGE_KEY = "chatboat_theme";

export function getTheme(): string {
  return localStorage.getItem(STORAGE_KEY) || "light";
}

export function applyTheme(id: string): void {
  document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem(STORAGE_KEY, id);
}
