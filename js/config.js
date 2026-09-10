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

const houseUpgradeCosts = {
  1: { name: "简陋草棚", capacity: 1, wood: 0, grass: 0, stone: 0, comfort: 5 },
  2: { name: "温馨木屋", capacity: 2, wood: 40, grass: 30, stone: 20, comfort: 20 },
  3: { name: "坚固石屋", capacity: 3, wood: 80, grass: 50, stone: 60, comfort: 40 },
  4: { name: "森林庄园", capacity: 4, wood: 150, grass: 100, stone: 120, comfort: 80 }
};

// 背包规格与负重配置
const backpackSpecs = {
  none: { name: "无背包", capacity: 5, wood: 0, grass: 0, meat: 0 },
  straw: { name: "编织草袋", capacity: 15, wood: 0, grass: 20, meat: 0 },
  leather: { name: "简易藤包", capacity: 35, wood: 25, grass: 35, meat: 0 },
  sturdy: { name: "坚固皮包", capacity: 70, wood: 40, grass: 40, meat: 5 }
};

// 各种烹饪食物的配方与属性配置
const foodRecipes = {
  fruitMashing: {
    id: "fruitMashing",
    name: "甘甜果泥",
    stamina: 20,
    cost: { fruit: 2, meat: 0 },
    baseSuccess: 0.6
  },
  roastedMeat: {
    id: "roastedMeat",
    name: "香喷喷烤肉",
    stamina: 35,
    cost: { fruit: 0, meat: 2 },
    baseSuccess: 0.5
  },
  meatStew: {
    id: "meatStew",
    name: "森林杂烩汤",
    stamina: 60,
    cost: { fruit: 2, meat: 2 },
    baseSuccess: 0.4
  }
};

// 1. 四季配置
const SEASONS = {
  spring: { name: "🌸 春季", staminaCostRate: 1.0, gatherRate: 1.2 },
  summer: { name: "☀️ 夏季", staminaCostRate: 1.3, gatherRate: 1.1 },
  autumn: { name: "🍂 秋季", staminaCostRate: 1.0, gatherRate: 1.5 },
  winter: { name: "❄️ 严冬", staminaCostRate: 1.8, gatherRate: 0.5 }
};

// 2. 细化天气全集配置（包含体力消耗倍率、是否允许出门、特殊效果）
const WEATHERS = {
  // --- 无降水基本状态 ---
  sunny: { name: "☀️ 晴天", staminaMod: 1.0, canGather: true, desc: "阳光明媚，非常适合出门搜集。" },
  cloudy: { name: "⛅ 多云", staminaMod: 1.0, canGather: true, desc: "凉爽宜人。" },
  overcast: { name: "☁️ 阴天", staminaMod: 1.05, canGather: true, desc: "天空阴沉沉的。" },

  // --- 液态降水 ---
  lightRain: { name: "🌧️ 小雨", staminaMod: 1.2, canGather: true, desc: "微风细雨，草木生长更快。" },
  moderateRain: { name: "🌧️ 中雨", staminaMod: 1.4, canGather: true, desc: "雨势渐大，小精灵有些湿透。" },
  heavyRain: { name: "🌧️ 大雨", staminaMod: 1.7, canGather: true, desc: "暴雨倾盆，路面泥泞。" },
  torrentialRain: { name: "⛈️ 暴雨", staminaMod: 2.2, canGather: false, desc: "水漫森林，危险！无法出门。" },
  downpour: { name: "🌩️ 特大暴雨", staminaMod: 3.0, canGather: false, desc: "山洪隐患，严禁出门！" },
  shower: { name: "🌦️ 阵雨", staminaMod: 1.3, canGather: true, desc: "来得快去得快的阵雨。" },
  thunderstorm: { name: "🌩️ 雷阵雨", staminaMod: 1.8, canGather: false, desc: "雷声隆隆，待在室内比较安全。" },
  freezingRain: { name: "🧊 冻雨", staminaMod: 2.0, canGather: false, desc: "雨滴落地即成冰，出行极易滑倒。" },

  // --- 固态降水 ---
  lightSnow: { name: "🌨️ 小雪", staminaMod: 1.3, canGather: true, desc: "雪花飘飘，世界变白了。" },
  moderateSnow: { name: "❄️ 中雪", staminaMod: 1.6, canGather: true, desc: "积雪渐厚，体力消耗增加。" },
  heavySnow: { name: "❄️ 大雪", staminaMod: 2.0, canGather: false, desc: "大雪封山，建议在室内烤火。" },
  blizzard: { name: "🌩️ 暴雪", staminaMod: 2.8, canGather: false, desc: "视线受阻，狂风暴雪！" },
  sleet: { name: "🌧️ 雨夹雪", staminaMod: 1.5, canGather: true, desc: "冰凉的雨雪交加。" },
  hail: { name: "🧊 冰雹", staminaMod: 2.5, canGather: false, desc: "坚硬的冰雹砸落，极度危险！" },
  graupel: { name: "⚪ 霰", staminaMod: 1.4, canGather: true, desc: "小冰粒落在地上沙沙作响。" },

  // --- 地面凝结与堆积 ---
  dew: { name: "💧 露", staminaMod: 1.0, canGather: true, desc: "清晨的草叶上挂满了水晶般的水珠。" },
  frost: { name: "❄️ 霜", staminaMod: 1.2, canGather: true, desc: "地面泛起一层薄霜，空气冰凉。" },
  ice: { name: "🧊 结冰", staminaMod: 1.4, canGather: true, desc: "积水冻结，步履维艰。" },

  // --- 视程障碍 (大气浑浊度) ---
  fog: { name: "🌫️ 雾", staminaMod: 1.3, canGather: true, desc: "浓雾弥漫，视野受限（带回藏品概率降低）。" },
  mist: { name: "🌫️ 轻雾", staminaMod: 1.1, canGather: true, desc: "森林蒙上了一层薄纱。" },
  haze: { name: "🌫️ 霾", staminaMod: 1.4, canGather: true, desc: "空气混浊，令人呼吸不适。" },

  // --- 沙尘现象 ---
  floatingDust: { name: "🧹 浮尘", staminaMod: 1.3, canGather: true, desc: "天空泛黄，细尘悬浮。" },
  blowingSand: { name: "🥪 扬沙", staminaMod: 1.6, canGather: true, desc: "风裹挟着沙尘吹过。" },
  sandstorm: { name: "🌪️ 沙尘暴", staminaMod: 2.5, canGather: false, desc: "黄沙漫天，无法视物！" },

  // --- 强对流与风暴 ---
  gale: { name: "💨 大风", staminaMod: 1.6, canGather: true, desc: "强风肆虐，可吹落树枝与野果！" },
  tornado: { name: "🌪️ 龙卷风", staminaMod: 4.0, canGather: false, desc: "毁灭性的强风！千万不能出门！" },
  typhoon: { name: "🌀 台风", staminaMod: 3.0, canGather: false, desc: "狂风暴雨袭击森林！" },
  severeThunderstorm: { name: "⚡ 雷暴", staminaMod: 2.2, canGather: false, desc: "电闪雷鸣，非常危险！" }
};

// 3. 季节专属的天气随机池（按概率权重分布）
const SEASON_WEATHER_POOLS = {
  spring: ['sunny', 'cloudy', 'overcast', 'lightRain', 'moderateRain', 'shower', 'dew', 'mist', 'fog', 'gale'],
  summer: ['sunny', 'cloudy', 'heavyRain', 'torrentialRain', 'shower', 'thunderstorm', 'hail', 'haze', 'typhoon', 'severeThunderstorm'],
  autumn: ['sunny', 'cloudy', 'overcast', 'lightRain', 'frost', 'mist', 'floatingDust', 'blowingSand', 'gale'],
  winter: ['cloudy', 'overcast', 'lightSnow', 'moderateSnow', 'heavySnow', 'blizzard', 'sleet', 'freezingRain', 'graupel', 'ice', 'frost']
};

const specialGifts = [
  { name: "闪亮的松果", type: "collectible" },
  { name: "五彩羽毛", type: "collectible" },
  { name: "幸运四叶草", type: "collectible" },
  { name: "光滑的鹅卵石", type: "collectible" }
];

const STAMINA_WARNING_THRESHOLD = 50;
const STAMINA_EXHAUSTED_THRESHOLD = 20;
const REST_STAMINA_RECOVERY_INTERVAL = 30;
