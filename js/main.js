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

// 核心更新：受“背包容量”严格限制的出游与物资收获
function elfAutoGatherCheck() {
  if (gameState.isExploring) return;
  if (gameState.stamina < 30) return;

  if (Math.random() < 0.20) {
    gameState.isExploring = true;

    // 1. 获取背包参数
    const currentBag = backpackSpecs[gameState.backpack || 'none'];
    const maxCapacity = currentBag.capacity;

    // 2. 出门前携带干粮与木棍（若有物资，按背包规格携带）
    let takeLog = "";
    if (gameState.cooked > 0) {
      gameState.cooked -= 1;
      takeLog = "，带上了一份熟食干粮";
    } else if (gameState.fruit > 0) {
      gameState.fruit -= 1;
      takeLog = "，口袋里揣了 1 颗野果";
    }

    if (gameState.weapon > 0 && Math.random() < 0.5) {
      takeLog += "，手拿小木棍防身";
    }

    addLog(`【自主远足】小精灵背上【${currentBag.name}】出发了${takeLog}...`);
    updateUI();

    setTimeout(() => {
      gameState.isExploring = false;

      // 3. 计算获得的初始野外物资总重
      let rawWood = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawGrass = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawStone = Math.floor(Math.random() * (maxCapacity / 3)) + 1;
      let rawFruit = Math.floor(Math.random() * 3);

      let totalWeight = rawWood + rawGrass + rawStone + rawFruit;

      // 4. 背包负重截断处理：如果不幸超出背包容量上限，只能舍弃多余的物资带回最大容量
      if (totalWeight > maxCapacity) {
        const ratio = maxCapacity / totalWeight;
        rawWood = Math.floor(rawWood * ratio);
        rawGrass = Math.floor(rawGrass * ratio);
        rawStone = Math.floor(rawStone * ratio);
        rawFruit = Math.floor(rawFruit * ratio);
      }

      gameState.wood += rawWood;
      gameState.grass += rawGrass;
      gameState.stone += rawStone;
      gameState.fruit += rawFruit;

      gameState.stamina = Math.max(10, gameState.stamina - 15);

      let totalGathered = rawWood + rawGrass + rawStone + rawFruit;
      addLog(`【远足归来】小精灵把【${currentBag.name}】装得满满的！带回了 ${rawWood}木 ${rawGrass}草 ${rawStone}石 ${rawFruit}果 (负重 ${totalGathered}/${maxCapacity})。`);
      
      gameState.lastActionTime = Date.now();
      updateUI(); saveGame();
    }, 6000);
  }
}

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
    elfAutoGatherCheck();
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
