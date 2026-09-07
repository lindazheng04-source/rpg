function updateActionTime() {
  gameState.lastActionTime = Date.now();
}

function eatFruit() {
  if (gameState.fruit < 1) { addLog("没有野果了，等小精灵出去找找吧。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.fruit -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 15);
  addLog("你喂小精灵啃了一颗酸甜的野果，恢复了 15 点体力。");
  updateActionTime(); updateUI(); saveGame();
}

function eatMeat() {
  if (gameState.meat < 1) { addLog("没有生肉了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.meat -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 25);
  addLog("你喂小精灵吃了一块风干肉，恢复了 25 点体力！");
  updateActionTime(); updateUI(); saveGame();
}

// 统一烹饪食物处理函数（使用单独食物的熟练度计算成功率）
function cookFood(recipeId) {
  const recipe = foodRecipes[recipeId];
  if (!recipe) return;

  if (!gameState.rooms.includes("厨房")) {
    addLog("还没有厨房，无法烹饪。请先建造厨房！");
    return;
  }

  // 检查物资
  if (gameState.fruit < recipe.cost.fruit || gameState.meat < recipe.cost.meat) {
    addLog(`烹饪【${recipe.name}】的食材不足！`);
    return;
  }

  // 扣除物资
  gameState.fruit -= recipe.cost.fruit;
  gameState.meat -= recipe.cost.meat;

  // 根据当前食物独立的熟练度算成功率
  const currentExp = gameState.recipeExp[recipeId] || 0;
  const successRate = recipe.baseSuccess + (currentExp / 100) * (1 - recipe.baseSuccess);

  if (Math.random() < successRate) {
    gameState.foods[recipeId] = (gameState.foods[recipeId] || 0) + 1;
    addLog(`【烹饪成功】你精心做出了【${recipe.name}】！`);
  } else {
    addLog(`【烹饪失败】不小心把【${recipe.name}】给做糊了...但熟练度提升了！`);
  }

  // 提升该食物专属的烹饪熟练度
  if (currentExp < 100) {
    gameState.recipeExp[recipeId] = Math.min(100, currentExp + 8);
  }

  updateActionTime(); updateUI(); saveGame();
}

// 吃特定熟食
function eatFood(recipeId) {
  const recipe = foodRecipes[recipeId];
  if (!recipe) return;

  if ((gameState.foods[recipeId] || 0) < 1) {
    addLog(`没有【${recipe.name}】了，快去厨房做一份吧！`);
    return;
  }
  if (gameState.stamina >= 100) {
    addLog("小精灵肚子饱饱的，吃不下了。");
    return;
  }

  gameState.foods[recipeId] -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + recipe.stamina);
  addLog(`你喂小精灵吃了【${recipe.name}】，恢复了 ${recipe.stamina} 点体力！`);
  updateActionTime(); updateUI(); saveGame();
}

function useMedicine() {
  if (gameState.medicine < 1) { addLog("没有药品了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵精神棒棒的，不需要吃药。"); return; }
  gameState.medicine -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 80);
  addLog("你喂小精灵服下了草药膏，体力大幅恢复了 80 点！");
  updateActionTime(); updateUI(); saveGame();
}

function craftMedicine() {
  if (gameState.grass < 3 || gameState.fruit < 1) {
    addLog("制作药品需要 3 份干草和 1 个野果。");
    return;
  }
  gameState.grass -= 3;
  gameState.fruit -= 1;
  gameState.medicine += 1;
  addLog("【玩家制作】你捣碎草药与野果，制作出了一份治疗药品！");
  updateActionTime(); updateUI(); saveGame();
}

function toggleAutoEat() {
  gameState.autoEat = !gameState.autoEat;
  addLog(`自动进食功能已 ${gameState.autoEat ? '开启' : '关闭'}。`);
  updateUI(); saveGame();
}

function craftWeapon() {
  if (gameState.wood < 5) {
    addLog("制作小木棍需要 5 个树枝。");
    return;
  }
  gameState.wood -= 5;
  gameState.weapon += 1;
  addLog("【玩家制作】你利用树枝削好了一把防身的小木棍！");
  updateActionTime(); updateUI(); saveGame();
}

function craftBackpack(type) {
  const spec = backpackSpecs[type];
  if (!spec) return;
  if (gameState.backpack === type) {
    addLog(`小精灵已经装备了【${spec.name}】。`);
    return;
  }

  const needMeat = spec.meat || 0;
  if (gameState.wood >= spec.wood && gameState.grass >= spec.grass && gameState.meat >= needMeat) {
    gameState.wood -= spec.wood;
    gameState.grass -= spec.grass;
    gameState.meat -= needMeat;
    gameState.backpack = type;
    addLog(`【制作装备】你缝制了【${spec.name}】！负重上限提升至 ${spec.capacity} 点。`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("制作该背包的材料不足。");
  }
}

function upgradeHouse() {
  const nextLevel = gameState.houseLevel + 1;
  const nextCost = houseUpgradeCosts[nextLevel];
  if (!nextCost) return;

  if (gameState.wood >= nextCost.wood && gameState.grass >= nextCost.grass && gameState.stone >= nextCost.stone) {
    gameState.wood -= nextCost.wood;
    gameState.grass -= nextCost.grass;
    gameState.stone -= nextCost.stone;
    gameState.houseLevel = nextLevel;
    addLog(`【房屋扩建】你帮小精灵把家扩建为了【${nextCost.name}】！`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("扩建物资不足。");
  }
}

function buildRoom(type) {
  const currentCapacity = houseUpgradeCosts[gameState.houseLevel].capacity;
  if (gameState.rooms.length >= currentCapacity) {
    addLog("房屋空间不够了！请先【扩建房屋】。");
    return;
  }

  const name = roomNames[type];
  const cost = roomCosts[type];
  if (gameState.rooms.includes(name)) return;

  if (gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone) {
    gameState.wood -= cost.wood;
    gameState.grass -= cost.grass;
    gameState.stone -= cost.stone;
    gameState.rooms.push(name);
    addLog(`【家园建造】你建造了【${name}】！舒适度 +${cost.comfort} 点！`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("建造物资不足。");
  }
}
