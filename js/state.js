let gameState = {
  wood: 0,
  grass: 0,
  stone: 0,
  fruit: 5,
  meat: 0,
  cooked: 0,
  medicine: 0,
  weapon: 0,
  stamina: 100,
  cookExp: 0,
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
      // 安全深层合并，防止旧存档缺乏结构崩溃
      gameState = { 
        ...gameState, 
        ...parsed,
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
