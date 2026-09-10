// 默认初始状态
const initialGameState = {
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

// 当前运行中的状态
let gameState = { ...initialGameState };

function saveGame() {
  DB.save(gameState);
}

function loadGame() {
  const isHasSave = !!localStorage.getItem('elf_game_v2');
  gameState = DB.load(initialGameState);
  
  if (typeof addLog === 'function') {
    if (isHasSave) {
      addLog("欢迎回来，小精灵正在家里等着你呢。");
    } else {
      addLog("四岁的小精灵在森林里醒来，独自一人。你需要帮他建造家园。");
    }
  }
}

function resetData() {
  if (confirm("确定要重置所有游戏进度吗？")) {
    DB.clear();
    location.reload();
  }
}
