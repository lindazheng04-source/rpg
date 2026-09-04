function checkAutoEat() {
  if (!gameState.autoEat) return;
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

function checkRestRecovery() {
  if (gameState.isExploring) return;
  const now = Date.now();
  if (now - gameState.lastActionTime >= REST_STAMINA_RECOVERY_INTERVAL * 1000) {
    if (gameState.stamina < 100) {
      gameState.stamina = Math.min(100, gameState.stamina + 1);
      gameState.lastActionTime = now;
      updateUI();
    }
  }
}

function autoExploreCheck() {
  if (gameState.isExploring) return;
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
      gameState.lastActionTime = Date.now();
      updateUI(); saveGame();
    }, 8000);
  }
}

// 核心优化：小动物拜访、物资留下与好感度逻辑
function animalVisitCheck() {
  const keys = Object.keys(gameState.animals);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];

  // 1. 舒适度决定拜访概率（基础基础仅 3%，每 10 点舒适度增加 1.2%，最高不超过 25%）
  const comfort = typeof getHouseComfort === 'function' ? getHouseComfort() : 5;
  const visitChance = Math.min(0.25, 0.03 + (comfort / 10) * 0.012);

  if (Math.random() < visitChance) {
    if (!animal.isResident) {
      // 2. 降低好感度每次上涨幅度：仅上涨 1 ~ 3 点（养成路线变长）
      const favorGain = Math.floor(Math.random() * 3) + 1;
      animal.favor = Math.min(100, animal.favor + favorGain);

      // 3. 50% 概率留下常规物资或特殊珍品
      let dropLog = "";
      if (Math.random() < 0.50) {
        const dropType = Math.random();
        if (dropType < 0.35) {
          const woodGain = Math.floor(Math.random() * 3) + 1;
          gameState.wood += woodGain;
          dropLog = `，顺便带来了 ${woodGain} 根树枝`;
        } else if (dropType < 0.70) {
          const fruitGain = Math.floor(Math.random() * 2) + 1;
          gameState.fruit += fruitGain;
          dropLog = `，并分享了 ${fruitGain} 颗甜野果`;
        } else {
          // 30% 的掉落概率获得特殊收藏品
          const gift = specialGifts[Math.floor(Math.random() * specialGifts.length)];
          if (!gameState.specialItems) gameState.specialItems = [];
          
          if (!gameState.specialItems.includes(gift.name)) {
            gameState.specialItems.push(gift.name);
            dropLog = `，并悄悄在桌上留下了珍贵礼物【${gift.name}】！`;
          } else {
            gameState.stone += 2;
            dropLog = "，顺路带回了 2 块平整的石头";
          }
        }
      }

      addLog(`【来访】${animal.name} 来家里串门了${dropLog} (好感度 +${favorGain}%)。`);

      if (animal.favor >= 100) {
        animal.isResident = true;
        addLog(`【新家人】${animal.name} 对你温馨的家非常满意，决定搬过来和小精灵一起生活了！`);
      }
    }
  }

  // 常驻小动物协助搜集的频率也同步放缓
  keys.forEach(k => {
    const a = gameState.animals[k];
    if (a.isResident && Math.random() < 0.08) {
      gameState.wood += 2;
      gameState.grass += 1;
      addLog(`【好帮手】住在家里的 ${a.name} 跑出去帮忙衔回了一些干草和树枝。`);
    }
  });
}

function gameLoop() {
  if (!gameState.isExploring) {
    checkAutoEat();
    checkRestRecovery();
    autoExploreCheck();
    animalVisitCheck();
  }
  updateUI();
  saveGame();
}

window.onload = () => {
  loadGame();
  gameState.lastActionTime = Date.now();
  updateUI();
  // 全局心跳拉长至 4 秒一次（显著降低来访过于频繁的感觉）
  setInterval(gameLoop, 4000); 
};
