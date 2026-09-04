let gameState = {
  wood: 0,
  grass: 0,
  stone: 0,
  fruit: 5,
  cooked: 0,
  weapon: 0,
  stamina: 100,
  cookExp: 0,
  houseLevel: 1,
  backpack: "none", // 新增：当前装备的背包类型 (none, straw, leather, sturdy)
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
  let baseComfort = houseUpgradeCosts[gameState.houseLevel].comfort;
  let roomsComfort = 0;
  gameState.rooms.forEach(roomName => {
    for (let key in roomNames) {
      if (roomNames[key] === roomName) {
        roomsComfort += roomCosts[key].comfort;
      }
    }
  });
  return baseComfort + roomsComfort;
}

function saveGame() {
  gameState.lastTime = Date.now();
  localStorage.setItem('elf_game_v2', JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem('elf_game_v2');
  if (saved) {
    const parsed = JSON.parse(saved);
    gameState = { ...gameState, ...parsed };
    addLog("欢迎回来，小精灵正在家里等着你呢。");
  } else {
    addLog("四岁的小精灵在森林里醒来，独自一人。你需要帮他建造家园。");
  }
}

function resetData() {
  if (confirm("确定要重置所有游戏进度吗？")) {
    localStorage.removeItem('elf_game_v2');
    location.reload();
  }
}
