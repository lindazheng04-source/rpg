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
  if (gameState.isExploring) return;

  const currentWeather = WEATHERS[gameState.weather] || WEATHERS.sunny;

  // 1. 恶劣天气判定
  if (!currentWeather.canGather) {
    if (Math.random() < 0.08) {
      addLog(`【预警】外面正值【${currentWeather.name}】，环境极其危险，小精灵躲在小屋里不便出门。`);
    }
    return;
  }

  // 2. 动态计算天气和季节下的体力消耗
  const seasonCfg = SEASONS[gameState.season] || SEASONS.spring;
  const baseStaminaCost = 15;
  const actualCost = Math.floor(baseStaminaCost * seasonCfg.staminaCostRate * currentWeather.staminaMod);

  if (gameState.stamina < actualCost) return;

  // 3. 25% 概率决定是否触发远足
  if (Math.random() < 0.25) {
    gameState.isExploring = true;

    const currentBag = backpackSpecs[gameState.backpack || 'none'] || backpackSpecs['none'];
    const maxCapacity = currentBag.capacity;

    let takeLog = "";
    let hasWeapon = false;
    const foods = gameState.foods || {};

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

    // 6秒后归来
    setTimeout(() => {
      gameState.isExploring = false;

      let rawWood = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawGrass = Math.floor(Math.random() * (maxCapacity / 2)) + 2;
      let rawStone = Math.floor(Math.random() * (maxCapacity / 3)) + 1;
      let rawFruit = Math.floor(Math.random() * 3);
      let rawMeat = (hasWeapon && Math.random() < 0.6) ? Math.floor(Math.random() * 2) + 1 : (Math.random() < 0.2 ? 1 : 0);

      let totalWeight = rawWood + rawGrass + rawStone + rawFruit + rawMeat;

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

      // 扣除计算好的实际体力消耗
      gameState.stamina = Math.max(0, gameState.stamina - actualCost);

      let totalGathered = rawWood + rawGrass + rawStone + rawFruit + rawMeat;
      let resultText = `${rawWood}木 ${rawGrass}草 ${rawStone}石 ${rawFruit}果`;
      if (rawMeat > 0) resultText += ` ${rawMeat}肉`;

      addLog(`【远足归来】小精灵把【${currentBag.name}】装得满满的！带回了 ${resultText} (负重 ${totalGathered}/${maxCapacity})。`);
      
      gameState.lastActionTime = Date.now();
      updateUI(); 
      saveGame();
    }, 60000);
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

// 天气与季节随机轮换
function updateWeatherAndSeason() {
  // 15% 概率触发天气变幻
  if (Math.random() < 0.15) {
    const pool = SEASON_WEATHER_POOLS[gameState.season] || SEASON_WEATHER_POOLS.spring;
    const newWeatherKey = pool[Math.floor(Math.random() * pool.length)];
    
    if (newWeatherKey !== gameState.weather) {
      gameState.weather = newWeatherKey;
      const wInfo = WEATHERS[newWeatherKey];
      addLog(`【天气变化】森林里的天气转为了【${wInfo.name}】—— ${wInfo.desc}`);

      // 极端气象特殊一次性效果：
      if (newWeatherKey === 'gale') {
        // 大风吹落干草和木材
        const bonusWood = Math.floor(Math.random() * 5) + 3;
        gameState.wood += bonusWood;
        addLog(`【大风福利】一阵狂风吹过，树梢上掉落下了 ${bonusWood} 根树枝！`);
      } else if (newWeatherKey === 'dew') {
        // 露水湿润，野果生长
        gameState.fruit += 2;
        addLog(`【晨露滋润】清晨的露水滋养了植物，小精灵在门口捡到了 2 颗野果！`);
      }
    }

    // 推进天数与季节切换
    gameState.seasonDay = (gameState.seasonDay || 1) + 1;
    if (gameState.seasonDay > 5) {
      gameState.seasonDay = 1;
      const seasonKeys = ['spring', 'summer', 'autumn', 'winter'];
      let nextIdx = (seasonKeys.indexOf(gameState.season) + 1) % seasonKeys.length;
      gameState.season = seasonKeys[nextIdx];
      addLog(`【季节更替】大地转换了色彩，迎来了【${SEASONS[gameState.season].name}】！`);
    }
  }
}

// 修改小精灵自动远足逻辑中的天气校验
function elfAutoGatherCheck() {
  if (gameState.isExploring) return;

  const currentWeather = WEATHERS[gameState.weather] || WEATHERS.sunny;

  // 如果天气不允许出门（如暴雨、台风、龙卷风、冰雹等）
  if (!currentWeather.canGather) {
    if (Math.random() < 0.08) {
      addLog(`【预警】外面正值【${currentWeather.name}】，环境极其危险，小精灵躲在小屋里不便出门。`);
    }
    return;
  }

  // 动态计算该天气和季节下的体力消耗
  const seasonCfg = SEASONS[gameState.season] || SEASONS.spring;
  const baseStaminaCost = 15;
  const actualCost = Math.floor(baseStaminaCost * seasonCfg.staminaCostRate * currentWeather.staminaMod);

  if (gameState.stamina < actualCost) return;

  // 触发远足
  if (Math.random() < 0.25) {
    // ... 触发远足并扣除 actualCost 体力
  }
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
