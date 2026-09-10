// 默认初始状态
const initialGameState = {
  wood: 0,
  grass: 0,
  stone: 0,
  fruit: 5,
  meat: 0,
  medicine: 0,
  weapon: 0,
  stamina: 100,
  houseLevel: 1,
  backpack: "none",
  specialItems: [],
  isExploring: false,
  autoEat: true,
  lastActionTime: Date.now(),
  rooms: [],
  foods: {             // 补上熟食库存
    fruitMashing: 0,
    roastedMeat: 0,
    meatStew: 0
  },
  recipeExp: {          // 补上单独烹饪熟练度
    fruitMashing: 0,
    roastedMeat: 0,
    meatStew: 0
  },
  currentBiome: 'land',         // 当前所在生境
  unlockedBiomes: ['land'],     // 已解锁的生境
  animals: {
    squirrel: { name: "小松鼠", favor: 0, level: 1, isResident: false, assignedJob: 'none', biome: 'land' },
    sparrow: { name: "小麻雀", favor: 0, level: 1, isResident: false, assignedJob: 'none', biome: 'aerial' },
    rabbit: { name: "小白兔", favor: 0, level: 1, isResident: false, assignedJob: 'none', biome: 'land' },
    poisonFrog: { name: "箭毒蛙", favor: 0, level: 1, isResident: false, assignedJob: 'none', biome: 'freshwater' },
    anglerfish: { name: "鮟鱇鱼", favor: 0, level: 1, isResident: false, assignedJob: 'none', biome: 'deepSea' }
  },
  skills:{
    mining: { level: 1, exp: 0 },
    logging: { level: 1, exp: 0 },
    crafting: { level: 1, exp: 0 },
    combat: { level: 1, exp: 0 }
  },
  season: 'spring',
  weather: 'sunny',
  seasonDay: 1, // 当前季节第几天（每5天切换一个季节）
  lastTime: Date.now()
  
};

gameState.skillPoints = 0;          // 可用技能点
gameState.unlockedTalents = [];     // 已解锁的技能树节点 ID 列表

// 当前运行中的状态
let gameState = { ...initialGameState };

function saveGame() {
  DB.save(gameState);
}

function loadGame() {
  const isHasSave = !!localStorage.getItem('elf_game_v2');
  gameState = DB.load(initialGameState);
  
  const now = Date.now();
  const offlineSeconds = Math.floor((now - (gameState.lastTime || now)) / 1000);
  
  if (isHasSave) {
    addLog("欢迎回来，小精灵正在家里等着你呢。");
    calculateOfflineProgress(offlineSeconds); // 结算挂机收益
  } else {
    addLog("四岁的小精灵在森林里醒来，独自一人。你需要帮他建造家园。");
  }
  
  gameState.lastTime = now;
}

function resetData() {
  if (confirm("确定要重置所有游戏进度吗？")) {
    DB.clear();
    location.reload();
  }
}

function getHouseComfort() {
  let baseComfort = houseUpgradeCosts[gameState.houseLevel]?.comfort || 5;
  let roomsComfort = 0;
  if (Array.isArray(gameState.rooms)) {
    gameState.rooms.forEach(roomName => {
      for (let key in roomNames) {
        if (roomNames[key] === roomName) {
          roomsComfort += roomCosts[key].comfort;
        }
      }
    });
  }
  return baseComfort + roomsComfort;
}
// 结算离线挂机收益
function calculateOfflineProgress(offlineSeconds) {
  if (offlineSeconds < 60) return; // 小于1分钟忽略

  // 离线时间上限设为 12 小时 (43200 秒)，防止数值暴涨
  const effectiveSeconds = Math.min(offlineSeconds, 43200);
  const hours = (effectiveSeconds / 3600).toFixed(1);

  // 每 5 分钟（300秒）算一次挂机产出周期
  const cycles = Math.floor(effectiveSeconds / 300);
  if (cycles <= 0) return;

  const currentBag = backpackSpecs[gameState.backpack || 'none'] || backpackSpecs['none'];
  const maxCap = currentBag.capacity;

  // 根据当前季节调整挂机产出
  const seasonCfg = SEASONS[gameState.season] || SEASONS.spring;
  const rate = seasonCfg.gatherRate;

  let totalWood = Math.floor(cycles * (maxCap * 0.2) * rate);
  let totalGrass = Math.floor(cycles * (maxCap * 0.2) * rate);
  let totalStone = Math.floor(cycles * (maxCap * 0.1) * rate);
  let totalFruit = Math.floor(cycles * 0.8 * rate);

  gameState.wood += totalWood;
  gameState.grass += totalGrass;
  gameState.stone += totalStone;
  gameState.fruit += totalFruit;

  // 住在家里的动物帮忙产出
  let animalLog = "";
  if (gameState.animals) {
    let residentCount = Object.values(gameState.animals).filter(a => a.isResident).length;
    if (residentCount > 0) {
      let extraWood = cycles * residentCount * 2;
      gameState.wood += extraWood;
      animalLog = `，居住的动物伙伴额外收集了 ${extraWood} 树枝`;
    }
  }

  addLog(`【离线挂机收益】离线 ${hours} 小时，小精灵和你一共收获了：${totalWood}木 ${totalGrass}草 ${totalStone}石 ${totalFruit}野果${animalLog}！`);
}
