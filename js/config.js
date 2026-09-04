// 静态数据与房屋建造参数配置
const roomNames = {
  kitchen: "厨房",
  bedroom: "睡房",
  classroom: "课堂",
  petcorner: "动物游乐角"
};

const roomCosts = {
  kitchen: { wood: 20, grass: 0, stone: 10 },
  bedroom: { wood: 30, grass: 20, stone: 0 },
  classroom: { wood: 40, grass: 0, stone: 30 },
  petcorner: { wood: 0, grass: 50, stone: 30 }
};

// 增加体力相关的常量配置
const STAMINA_WARNING_THRESHOLD = 50; // 疲惫状态阈值
const STAMINA_EXHAUSTED_THRESHOLD = 20; // 极度疲惫（行动限制）阈值
const REST_STAMINA_RECOVERY_INTERVAL = 30; // 在家无动作30秒回复1点体力
