export interface DanmuItem {
  id: string;
  text: string;
  color: string;
  font: string; // New font property
  track: number; // Vertical lane index
  speed: number; // Duration in seconds
  timestamp: number;
}

export interface FontOption {
  name: string;
  value: string;
}

export interface BackgroundSettings {
  type: string;
  src: string;
}

// Simplified State, removed admin/background settings since logic is now automatic
export interface AppState {
  // No global state needed for this simple version, managed in components
}