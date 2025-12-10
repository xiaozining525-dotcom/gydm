
import { DanmuItem, FontOption } from "./types";

export const MAX_TRACKS = 12; // 稍微减少轨道数以防止过于拥挤
export const COOLDOWN_MS = 5000;

// 字体配置
export const FONT_OPTIONS: FontOption[] = [
  { name: '默认黑体', value: '"Noto Sans SC", sans-serif' },
  { name: '快乐体', value: '"ZCOOL KuaiLe", cursive' },
  { name: '古风毛笔', value: '"Ma Shan Zheng", cursive' },
  { name: '草书手写', value: '"Long Cang", cursive' },
];

// Empty initial comments as requested. 
// The wall will be empty until data is fetched from the DB or user sends a message.
export const INITIAL_COMMENTS: string[] = [];

export const generateInitialDanmu = (text: string): DanmuItem => ({
  id: Math.random().toString(36).substr(2, 9),
  text,
  color: '#ffffff',
  font: FONT_OPTIONS[0].value,
  track: Math.floor(Math.random() * MAX_TRACKS),
  speed: 10 + Math.random() * 5,
  timestamp: Date.now(),
});
