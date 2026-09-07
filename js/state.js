let gameState = {
  wood: 0,
  grass: 0,
  stone: 0,
  fruit: 5,
  meat: 0,
  medicine: 0,
  weapon: 0,
  // 各种烹饪食物的库存数量
  foods: {
    fruitMashing: 0,
    roastedMeat: 0,
    meatStew: 0
  },
  // 每种食物独有的烹饪熟练度 (0 - 100)
  recipeExp: {
    fruitMashing: 0,
    roastedMeat: 0,
    meatStew: 0
  },
  stamina: 100,
  houseLevel: 1,
  backpack: "none",
  specialItems: [],
  isExploring: false,
  autoEat: true,
  lastActionTime: Date.now(),
  rooms: [],
  animals: {
    squirrel: { name: "小松鼠", favor: 0, isResident: false },
    bird: { name: "小麻雀", favor: 0, isResident: false },
    rabbit: { name: "小白兔", favor: 0, isResident: false }
  },
  lastTime: Date.now()
};

function getHouseComfort() {
  const currentHouse = houseUpgradeCosts[gameState.houseLevel] || houseUpgradeCosts[1];
  let baseComfort = currentHouse.comfort || 5;
  let roomsComfort = 0;
  if (Array.isArray(gameState.rooms)) {
    gameState.rooms.forEach(roomName => {
      for (let key in roomNames) {
        if (roomNames[key] === roomName) {
          roomsComfort += (roomCosts[key] ? roomCosts[key].comfort : 0);
        }
      }
    });
  }
  return baseComfort + roomsComfort;
}

function saveGame() {
  gameState.lastTime = Date.now();
  localStorage.setItem('elf_game_v2', JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem('elf_game_v2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      gameState = { 
        ...gameState, 
        ...parsed,
        foods: { ...gameState.foods, ...(parsed.foods || {}) },
        recipeExp: { ...gameState.recipeExp, ...(parsed.recipeExp || {}) },
        animals: { ...gameState.animals, ...(parsed.animals || {}) },
        rooms: parsed.rooms || [],
        specialItems: parsed.specialItems || []
      };
      if (typeof addLog === 'function') addLog("欢迎回来，小精灵正在家里等着你呢。");
    } catch (e) {
      console.error("读取存档失败：", e);
    }
  } else {
    if (typeof addLog === 'function') addLog("四岁的小精灵在森林里醒来，独自一人。你需要帮他建造家园。");
  }
}

function resetData() {
  if (confirm("确定要重置所有游戏进度吗？")) {
    localStorage.removeItem('elf_game_v2');
    location.reload();
  }
}
