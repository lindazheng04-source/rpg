// 自动进食检测
function checkAutoEat() {
  if (!gameState.autoEat) return;

  // 当体力低于 50 时，若身上有食物，自动进食
  if (gameState.stamina < STAMINA_WARNING_THRESHOLD) {
    if (gameState.cooked > 0) {
      gameState.cooked -= 1;
      gameState.stamina = Math.min(100, gameState.stamina + 50);
      addLog("【自动进食】小精灵有些疲惫，自动吃了一份熟食，恢复了 50 体力。");
    } else if (gameState.fruit > 0) {
      gameState.fruit -= 1;
      gameState.stamina = Math.min(100, gameState.stamina + 15);
      addLog("【自动进食】小精灵有些疲惫，自动啃了一颗野果，恢复了 15 体力。");
    }
  }
}

// 无动作在家歇息恢复体力
function checkRestRecovery() {
  if (gameState.isExploring) return;

  const now = Date.now();
  // 30 秒（30000 毫秒）内无任何手动操作或处于休息状态，体力 +1
  if (now - gameState.lastActionTime >= REST_STAMINA_RECOVERY_INTERVAL * 1000) {
    if (gameState.stamina < 100) {
      gameState.stamina = Math.min(100, gameState.stamina + 1);
      // 重置最后操作时间，避免每秒都重复加
      gameState.lastActionTime = now;
      updateUI();
    }
  }
}

function autoExploreCheck() {
  if (gameState.isExploring) return;

  // 如果体力低于 20，绝对不触发远足
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) return;

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
      gameState.lastActionTime = Date.now(); // 远足归来重置无动作时间
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
    // 自动进食检查
    checkAutoEat();

    // 歇息恢复检查
    checkRestRecovery();

    autoExploreCheck();
    animalVisitCheck();
  }

  updateUI();
  saveGame();
}

// 页面加载完成后启动
window.onload = () => {
  loadGame();
  gameState.lastActionTime = Date.now(); // 初始化动作计时
  updateUI();
  setInterval(gameLoop, 2000); // 改为每 2 秒检测一次响应更敏捷
};
