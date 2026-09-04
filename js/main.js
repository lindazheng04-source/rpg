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

// 核心优化：小精灵完全自主外出搜集物资
function elfAutoGatherCheck() {
  if (gameState.isExploring) return;

  // 体力小于 30 时小精灵太累了，不出门
  if (gameState.stamina < 30) return;

  // 每次轮询有 20% 的概率小精灵会想要出门探索/捡东西
  if (Math.random() < 0.20) {
    gameState.isExploring = true;
    addLog("【自主活动】小精灵哼着歌，蹦蹦跳跳地出门去附近树林捡物资了...");
    updateUI();

    // 6 秒后搜集归来
    setTimeout(() => {
      gameState.isExploring = false;

      // 搜集成果（树枝、干草、石头、野果）
      const foundWood = Math.floor(Math.random() * 4) + 2;
      const foundGrass = Math.floor(Math.random() * 4) + 2;
      const foundStone = Math.floor(Math.random() * 3) + 1;
      const foundFruit = Math.floor(Math.random() * 3);

      gameState.wood += foundWood;
      gameState.grass += foundGrass;
      gameState.stone += foundStone;
      gameState.fruit += foundFruit;

      // 出门消耗 15 点体力
      gameState.stamina = Math.max(10, gameState.stamina - 15);

      let resultText = `带回了 ${foundWood} 树枝, ${foundGrass} 干草, ${foundStone} 石头`;
      if (foundFruit > 0) resultText += `, ${foundFruit} 颗野果`;

      addLog(`【外出归来】小精灵满载而归！${resultText}。`);
      
      gameState.lastActionTime = Date.now();
      updateUI(); saveGame();
    }, 6000);
  }
}

// 动物拜访逻辑
function animalVisitCheck() {
  const keys = Object.keys(gameState.animals);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];

  const comfort = typeof getHouseComfort === 'function' ? getHouseComfort() : 5;
  const visitChance = Math.min(0.25, 0.03 + (comfort / 10) * 0.012);

  if (Math.random() < visitChance) {
    if (!animal.isResident) {
      const favorGain = Math.floor(Math.random() * 3) + 1;
      animal.favor = Math.min(100, animal.favor + favorGain);

      let dropLog = "";
      if (Math.random() < 0.40) {
        const dropRoll = Math.random();

        if (dropRoll < 0.45) {
          const woodGain = Math.floor(Math.random() * 3) + 1;
          gameState.wood += woodGain;
          dropLog = `，顺便带来了 ${woodGain} 根树枝`;
        } else if (dropRoll < 0.85) {
          const fruitGain = Math.floor(Math.random() * 2) + 1;
          gameState.fruit += fruitGain;
          dropLog = `，并分享了 ${fruitGain} 颗甜野果`;
        } else {
          const gift = specialGifts[Math.floor(Math.random() * specialGifts.length)];
          if (!gameState.specialItems) gameState.specialItems = [];
          
          if (!gameState.specialItems.includes(gift.name)) {
            gameState.specialItems.push(gift.name);
            dropLog = `，并悄悄在桌上留下了极其珍贵的礼物【${gift.name}】！`;
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
    elfAutoGatherCheck(); // 小精灵自主外出捡物资
    animalVisitCheck();
  }
  updateUI();
  saveGame();
}

window.onload = () => {
  loadGame();
  gameState.lastActionTime = Date.now();
  updateUI();
  setInterval(gameLoop, 4000);
};
