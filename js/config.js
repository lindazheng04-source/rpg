// 静态数据与房屋建造参数配置
const roomNames = {
  kitchen: "厨房",
  bedroom: "睡房",
  classroom: "课堂",
  petcorner: "动物游乐角"
};

const roomCosts = {
  kitchen: { wood: 20, grass: 0, stone: 10, comfort: 15 },
  bedroom: { wood: 30, grass: 20, stone: 0, comfort: 25 },
  classroom: { wood: 40, grass: 0, stone: 30, comfort: 20 },
  petcorner: { wood: 0, grass: 50, stone: 30, comfort: 35 }
};

// 房屋扩建配置 (每级扩建解锁更多房间容量)
const houseUpgradeCosts = {
  1: { name: "简陋草棚", capacity: 1, wood: 0, grass: 0, stone: 0, comfort: 5 },
  2: { name: "温馨木屋", capacity: 2, wood: 40, grass: 30, stone: 20, comfort: 20 },
  3: { name: "坚固石屋", capacity: 3, wood: 80, grass: 50, stone: 60, comfort: 40 },
  4: { name: "森林庄园", capacity: 4, wood: 150, grass: 100, stone: 120, comfort: 80 }
};

// 特殊礼物池（动物拜访或居住时随机赠送）
const specialGifts = [
  { name: "闪亮的松果", effect: "纯好看的收藏品", wood: 5 },
  { name: "五彩羽毛", effect: "可以用来装饰房间", grass: 10 },
  { name: "幸运四叶草", effect: "象征着好运", fruit: 3 },
  { name: "坚硬的圆石", effect: "打磨得很平整的石头", stone: 8 }
];

// 体力常量配置
const STAMINA_WARNING_THRESHOLD = 50;
const STAMINA_EXHAUSTED_THRESHOLD = 20;
const REST_STAMINA_RECOVERY_INTERVAL = 30;
