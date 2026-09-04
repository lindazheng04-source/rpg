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

// 动物拜访与物资/特殊物品留存逻辑
function animalVisitCheck() {
  const keys = Object.keys(gameState.animals);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];

  // 1. 舒适度越高，拜访概率越高 (基础 5%，每 10 点舒适度 + 1.5%，最高 30%)
  const comfort = getHouseComfort();
  const visitChance = Math.min(0.30, 0.05 + (comfort / 10) * 0.015);

  if (Math.random() < visitChance) {
    if (!animal.isResident) {
      // 2. 好感度上涨幅度放缓（每次仅 +2% ~ +5%）
      const gain = Math.floor(Math.random() * 4) + 2;
      animal.favor = Math.min(100, animal.favor + gain);
      
      let giftLog = "";
      // 3. 拜访概率留下基础物资或特殊物品
      if (Math.random() < 0.6) {
        const rewardType = Math.random();
        if (rewardType < 0.3) {
          gameState.wood += 3;
          giftLog = "，顺便衔来了 3 根干树枝";
        } else if (rewardType < 0.6) {
          gameState.fruit += 2;
          giftLog = "，并分享了 2 颗甜野果";
        } else {
          // 赠送特殊珍贵物品
          const gift = specialGifts[Math.floor(Math.random() * specialGifts.length)];
          if (!gameState.specialItems.includes(gift.name)) {
            gameState.specialItems.push(gift.name);
            giftLog = `，并悄悄留下了一件礼物【${gift.name}】！`;
          } else {
            gameState.stone += 3;
            giftLog = "，顺路带回了 3 块平整的石头";
          }
        }
      }

      addLog(`【来访】${animal.name} 来串门了${giftLog}(好感度 +${gain}%)。`);

      if (animal.favor >= 100) {
        animal.isResident = true;
        addLog(`【新家人】${animal.name} 对这里的环境感到非常满意，决定搬过来和小精灵一起生活了！`);
      }
    }
  }

  // 常驻小动物日常帮忙机制
  keys.forEach(k => {
    const a = gameState.animals[k];
    if (a.isResident && Math.random() < 0.15) { // 降低常驻动物搜刮频率
      gameState.wood += 2;
      gameState.grass += 2;
      addLog(`【好帮手】住在家里的 ${a.name} 跑出去帮忙衔回了一些树枝和干草！`);
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
  setInterval(gameLoop, 3000); // 调慢全局心跳至 3 秒，降低整体事件触发频率
};
