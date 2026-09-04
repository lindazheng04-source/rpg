// 定时挂机逻辑与主循环入口

function autoExploreCheck() {
  if (gameState.isExploring) return;

  if (gameState.weapon >= 1 && (gameState.fruit >= 2 || gameState.cooked >= 1) && gameState.stamina >= 60) {
    gameState.isExploring = true;
    if (gameState.cooked >= 1) gameState.cooked -= 1; else gameState.fruit -= 2;
    
    addLog("【自主远足】小精灵收拾好背包，带上小木棍，自主出门去森林深处探索了！");
    updateUI();

    setTimeout(() => {
      gameState.isExploring = false;
      const foundStone = Math.floor(Math.random() * 5) + 2;
      const foundFruit = Math.floor(Math.random() * 4) + 1;
      gameState.stone += foundStone;
      gameState.fruit += foundFruit;
      gameState.stamina = Math.max(10, gameState.stamina - 30);
      addLog(`【远足归来】小精灵平安回家！带回了 ${foundStone} 块石头和 ${foundFruit} 颗野果。`);
      updateUI(); saveGame();
    }, 8000);
  }
}

function animalVisitCheck() {
  const keys = Object.keys(gameState.animals);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];

  const hasPetCorner = gameState.rooms.includes("动物游乐角");
  const chance = hasPetCorner ? 0.4 : 0.2;

  if (Math.random() < chance) {
    if (!animal.isResident) {
      const gain = hasPetCorner ? 15 : 8;
      animal.favor = Math.min(100, animal.favor + gain);
      addLog(`【来访】${animal.name} 来串门了！在家里开心地玩了一会儿。(好感度 +${gain}%)`);

      if (animal.favor >= 100) {
        animal.isResident = true;
        addLog(`【新家人】${animal.name} 对这里感到非常温暖，决定搬过来和小精灵一起生活了！`);
      }
    }
  }

  keys.forEach(k => {
    const a = gameState.animals[k];
    if (a.isResident && Math.random() < 0.3) {
      gameState.wood += 2;
      gameState.grass += 2;
      addLog(`【好帮手】住在家里的 ${a.name} 主动跑出去帮忙衔回了一些树枝和干草！`);
    }
  });
}

function gameLoop() {
  if (!gameState.isExploring) {
    if (!gameState.rooms.includes("睡房")) {
      gameState.stamina = Math.max(0, gameState.stamina - 1);
    }
    
    gameState.wood += 1;
    gameState.grass += 1;

    autoExploreCheck();
    animalVisitCheck();
  }

  updateUI();
  saveGame();
}

// 页面加载完成后启动
window.onload = () => {
  loadGame();
  updateUI();
  setInterval(gameLoop, 4000); // 4秒一个 tick
};
