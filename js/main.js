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

// 核心更新：带武器出门采集“肉类”与“药草”
function elfAutoGatherCheck() {
  if (gameState.isExploring) return;
  if (gameState.stamina < 30) return;

  if (Math.random() < 0.20) {
    gameState.isExploring = true;

    // 是否配备了木棍武器
    const hasWeapon = gameState.weapon > 0;
    if (hasWeapon) {
      addLog("【自主打猎/防身】小精灵背上小木棍，威风凛凛地进山探索了！");
    } else {
      addLog("【自主采集】小精灵外出采摘和捡树枝去了...");
    }
    updateUI();

    setTimeout(() => {
      gameState.isExploring = false;

      const foundWood = Math.floor(Math.random() * 3) + 1;
      const foundGrass = Math.floor(Math.random() * 3) + 1;
      const foundStone = Math.floor(Math.random() * 2) + 1;
      const foundFruit = Math.floor(Math.random() * 2);
      
      // 1. 采集药草的概率（35% 获得 1 份药草）
      let foundHerb = 0;
      if (Math.random() < 0.35) {
        foundHerb = Math.floor(Math.random() * 2) + 1;
      }

      // 2. 携带武器时，50% 概率打猎获得肉类！并且武器有 20% 概率损耗
      let foundMeat = 0;
      let weaponBroken = false;

      if (hasWeapon && Math.random() < 0.50) {
        foundMeat = Math.floor(Math.random() * 2) + 1;
        
        // 武器耐久消耗
        if (Math.random() < 0.20) {
          gameState.weapon -= 1;
          weaponBroken = true;
        }
      }

      // 增加获得物存入状态
      gameState.wood += foundWood;
      gameState.grass += foundGrass;
      gameState.stone += foundStone;
      gameState.fruit += foundFruit;
      gameState.herb += foundHerb;
      gameState.meat += foundMeat;

      gameState.stamina = Math.max(10, gameState.stamina - 15);

      // 日志输出拼接
      let logs = [`带回了 ${foundWood} 树枝, ${foundGrass} 干草`];
      if (foundHerb > 0) logs.push(`${foundHerb} 🌿药草`);
      if (foundMeat > 0) logs.push(`${foundMeat} 🥩肉类`);
      if (foundFruit > 0) logs.push(`${foundFruit} 野果`);

      let logText = `【探索归来】小精灵满载而归！${logs.join('，')}`;
      if (weaponBroken) {
        logText += "。(⚠️小木棍在狩猎中损坏了)";
      }

      addLog(logText);
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
            dropLog = `，并悄悄留下了珍贵礼物【${gift.name}】！`;
          } else {
            gameState.stone += 2;
            dropLog = "，顺路带回了 2 块石头";
          }
        }
      }

      addLog(`【来访】${animal.name} 来家里串门了${dropLog} (好感度 +${favorGain}%)。`);

      if (animal.favor >= 100) {
        animal.isResident = true;
        addLog(`【新家人】${animal.name} 决定搬过来和小精灵一起生活了！`);
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
