function checkAutoEat() {
  if (!gameState.autoEat) return;
  if (gameState.stamina < STAMINA_WARNING_THRESHOLD) {
    if (gameState.medicine > 0 && gameState.stamina < 30) {
      gameState.medicine -= 1;
      gameState.stamina = Math.min(100, gameState.stamina + 80);
      addLog("【自动紧急治疗】小精灵伤势极重，使用了药品！");
      return;
    }

    // 安全检查 foods 对象是否存在
    const foods = gameState.foods || {};

    // 优先食用更高级的熟食
    for (let key of ['meatStew', 'roastedMeat', 'fruitMashing']) {
      if ((foods[key] || 0) > 0) {
        const recipe = foodRecipes[key];
        gameState.foods[key] -= 1;
        gameState.stamina = Math.min(100, gameState.stamina + recipe.stamina);
        addLog(`【自动进食】小精灵有些疲惫，自动吃了【${recipe.name}】，恢复了 ${recipe.stamina} 点体力。`);
        return;
      }
    }

    if (gameState.meat > 0) {
      gameState.meat -= 1;
      gameState.stamina = Math.min(100, gameState.stamina + 25);
      addLog("【自动进食】小精灵吃了块干肉，恢复了 25 体力。");
    } else if (gameState.fruit > 0) {
      gameState.fruit -= 1;
      gameState.stamina = Math.min(100, gameState.stamina + 15);
      addLog("【自动进食】小精灵啃了颗野果，恢复了 15 体力。");
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

function elfAutoGatherCheck() {
  // 如果已经在远足中，直接跳过
  if (gameState.isExploring) return;

  // 体力不足 30 时无法出门
  if (gameState.stamina < 30) return;

  // 25% 概率决定是否触发远足
  if (Math.random() < 0.25) {
    gameState.isExploring = true;

    const currentBag = backpackSpecs[gameState.backpack || 'none'] || backpackSpecs['none'];
    const maxCapacity = currentBag.capacity;

    let takeLog = "";
    let hasWeapon = false;
    
    // 安全检查 foods 结构
    const foods = gameState.foods || {};

    // 携带食物带出门（加防空安全链）
    if ((foods.meatStew || 0) > 0) {
      gameState.foods.meatStew -= 1;
      takeLog = "，带上了森林杂烩汤干粮";
    } else if ((foods.roastedMeat || 0) > 0) {
      gameState.foods.roastedMeat -= 1;
      takeLog = "，带上了香喷喷烤肉";
    } else if ((foods.fruitMashing || 0) > 0) {
      gameState.foods.fruitMashing -= 1;
      takeLog = "，带上了甘甜果泥";
    } else if (gameState.fruit > 0) {
      gameState.fruit -= 1;
      takeLog = "，揣了 1 颗野果";
    }

    if (gameState.weapon > 0) {
      hasWeapon = true;
      takeLog += "，手拿小木棍防身";
    }

    addLog(`【自主远足】小精灵背上【${currentBag.name}】出发了${takeLog}...`);
    updateUI();

    // 6秒后远足归来
    setTimeout(() => {
      gameState.isExploring = false;

      let rawWood = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawGrass = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawStone = Math.floor(Math.random() * (maxCapacity / 3)) + 1;
      let rawFruit = Math.floor(Math.random() * 3);
      let rawMeat = (hasWeapon && Math.random() < 0.6) ? Math.floor(Math.random() * 2) + 1 : (Math.random() < 0.2 ? 1 : 0);

      let totalWeight = rawWood + rawGrass + rawStone + rawFruit + rawMeat;

      // 负重超限截断计算
      if (totalWeight > maxCapacity && totalWeight > 0) {
        const ratio = maxCapacity / totalWeight;
        rawWood = Math.floor(rawWood * ratio);
        rawGrass = Math.floor(rawGrass * ratio);
        rawStone = Math.floor(rawStone * ratio);
        rawFruit = Math.floor(rawFruit * ratio);
        rawMeat = Math.floor(rawMeat * ratio);
      }

      gameState.wood += rawWood;
      gameState.grass += rawGrass;
      gameState.stone += rawStone;
      gameState.fruit += rawFruit;
      gameState.meat += rawMeat;

      gameState.stamina = Math.max(10, gameState.stamina - 15);

      let totalGathered = rawWood + rawGrass + rawStone + rawFruit + rawMeat;
      let resultText = `${rawWood}木 ${rawGrass}草 ${rawStone}石 ${rawFruit}果`;
      if (rawMeat > 0) resultText += ` ${rawMeat}肉`;

      addLog(`【远足归来】小精灵把【${currentBag.name}】装得满满的！带回了 ${resultText} (负重 ${totalGathered}/${maxCapacity})。`);
      
      gameState.lastActionTime = Date.now();
      updateUI(); 
      saveGame();
    }, 6000);
  }
}

function animalVisitCheck() {
  if (!gameState.animals) return;
  const keys = Object.keys(gameState.animals);
  if (keys.length === 0) return;

  const key = keys[Math.floor(Math.random() * keys.length)];
  const animal = gameState.animals[key];
  if (!animal) return;

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
            dropLog = `，并在桌上留下了礼物【${gift.name}】！`;
          } else {
            gameState.stone += 2;
            dropLog = "，顺路带回了 2 块平整的石头";
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
    if (a && a.isResident && Math.random() < 0.08) {
      gameState.wood += 2;
      gameState.grass += 1;
      addLog(`【好帮手】住在家里的 ${a.name} 跑出去帮忙衔回了一些干草和树枝。`);
    }
  });
}

// 随机轮换季节与天气
function updateWeatherAndSeason() {
  // 每次触发有 15% 概率切换天气
  if (Math.random() < 0.15) {
    const pool = SEASON_WEATHER_POOL[gameState.season] || SEASON_WEATHER_POOL.spring;
    const newWeather = pool[Math.floor(Math.random() * pool.length)];
    
    if (newWeather !== gameState.weather) {
      gameState.weather = newWeather;
      const wInfo = WEATHERS[newWeather];
      addLog(`【天气变化】森林里的天气转为了【${wInfo.name}】。`);
    }

    // 推进季节日子（每 20 次天气变幻推进 1 天）
    gameState.seasonDay = (gameState.seasonDay || 1) + 1;
    if (gameState.seasonDay > 5) { // 5 天换一个季节
      gameState.seasonDay = 1;
      const seasonKeys = ['spring', 'summer', 'autumn', 'winter'];
      let nextIdx = (seasonKeys.indexOf(gameState.season) + 1) % seasonKeys.length;
      gameState.season = seasonKeys[nextIdx];
      addLog(`【季节更替】季节交替，迎来了【${SEASONS[gameState.season].name}】！`);
    }
  }
}

// 在 elfAutoGatherCheck 函数开头加入天气判定：
function elfAutoGatherCheck() {
  if (gameState.isExploring) return;

  // 极端天气（台风/暴风雪）禁止出门
  const currentWeather = WEATHERS[gameState.weather] || WEATHERS.sunny;
  if (!currentWeather.canGather) {
    if (Math.random() < 0.1) {
      addLog(`【天气恶劣】外面正刮着【${currentWeather.name}】，小精灵乖乖待在家里不敢出门。`);
    }
    return;
  }

  // 计算季节与天气对体力消耗的叠加影响
  const seasonCfg = SEASONS[gameState.season] || SEASONS.spring;
  const baseStaminaCost = 15;
  const actualCost = Math.floor(baseStaminaCost * seasonCfg.staminaCostRate * currentWeather.staminaMod);
  
  if (gameState.stamina < actualCost) return;

  // ... 原有的 25% 概率触发远足逻辑
  // 扣体力时使用计算好的实际消耗：
  // gameState.stamina = Math.max(10, gameState.stamina - actualCost);
}

function gameLoop() {
  if (!gameState.isExploring) {
    updateWeatherAndSeason(); // 天气/季节更新
    checkAutoEat();
    checkRestRecovery();
    elfAutoGatherCheck();
    animalVisitCheck();
  }
  updateUI();
}

window.onload = () => {
  loadGame();
  gameState.lastActionTime = Date.now();
  updateUI();
  setInterval(gameLoop, 4000);
  setInterval(saveGame, 30000);
};
