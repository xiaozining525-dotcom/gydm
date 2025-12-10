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

export const INITIAL_COMMENTS: string[] = [
  "先占个座～ 这个弹幕墙也太简洁好⽤了吧✨",
  "这个星空背景好治愈啊 ✨",
  "测试测试，看看弹幕能不能正常显示✅",
  "字体居然可以换，太酷了！",
  "坐等流星划过~ 🌠",
  "谁懂！这种无门槛发弹幕的感觉太舒服了",
  "祝大家心想事成！",
  "路过打卡📌 希望这个弹幕墙能火起来",
  "谁懂！这种无门槛发弹幕的感觉太舒服了"
];

export const generateInitialDanmu = (text: string): DanmuItem => ({
  id: Math.random().toString(36).substr(2, 9),
  text,
  color: '#ffffff',
  font: FONT_OPTIONS[0].value,
  track: Math.floor(Math.random() * MAX_TRACKS),
  speed: 10 + Math.random() * 5,
  timestamp: Date.now(),
});