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

// 核心调整：动物拜访与精细化掉落概率
function animalVisitCheck() {
  const keys = Object.keys(gameState.animals);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];

  // 1. 舒适度决定拜访概率（基础 3%，最高 25%）
  const comfort = typeof getHouseComfort === 'function' ? getHouseComfort() : 5;
  const visitChance = Math.min(0.25, 0.03 + (comfort / 10) * 0.012);

  if (Math.random() < visitChance) {
    if (!animal.isResident) {
      // 2. 好感度缓慢增加 (+1% ~ +3%)
      const favorGain = Math.floor(Math.random() * 3) + 1;
      animal.favor = Math.min(100, animal.favor + favorGain);

      let dropLog = "";
      
      // 3. 40% 概率带礼物/物资
      if (Math.random() < 0.40) {
        const dropRoll = Math.random();

        // 【概率阶梯设计】：
        // 45% 概率：树枝/干草（普通）
        // 40% 概率：野果/石头（常见）
        // 15% 概率：特殊收藏品（稀有）
        
        if (dropRoll < 0.45) {
          const woodGain = Math.floor(Math.random() * 3) + 1;
          gameState.wood += woodGain;
          dropLog = `，顺便带来了 ${woodGain} 根树枝`;
        } else if (dropRoll < 0.85) {
          const fruitGain = Math.floor(Math.random() * 2) + 1;
          gameState.fruit += fruitGain;
          dropLog = `，并分享了 ${fruitGain} 颗甜野果`;
        } else {
          // 仅 15% 极低概率触发特殊收藏品掉落！
          const gift = specialGifts[Math.floor(Math.random() * specialGifts.length)];
          if (!gameState.specialItems) gameState.specialItems = [];
          
          if (!gameState.specialItems.includes(gift.name)) {
            gameState.specialItems.push(gift.name);
            dropLog = `，并悄悄在桌上留下了极其珍贵的礼物【${gift.name}】！`;
          } else {
            // 已有该收藏品时，退化为普通石头
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

  // 常驻小动物日常协助
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
  setInterval(gameLoop, 4000); // 4 秒心跳
};
