function updateActionTime() {
  gameState.lastActionTime = Date.now();
}

function eatFruit() {
  if (gameState.fruit < 1) { addLog("没有野果了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.fruit -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 15);
  addLog("小精灵啃了一颗酸甜的野果，恢复了 15 点体力。");
  updateActionTime(); updateUI(); saveGame();
}

function eatCooked() {
  if (gameState.cooked < 1) return;
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.cooked -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 50);
  addLog("小精灵享用了一顿香喷喷的热熟食，恢复了 50 点体力！");
  updateActionTime(); updateUI(); saveGame();
}

function toggleAutoEat() {
  gameState.autoEat = !gameState.autoEat;
  addLog(`自动进食功能已 ${gameState.autoEat ? '开启' : '关闭'}。`);
  updateUI(); saveGame();
}

// 房屋扩建
function upgradeHouse() {
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    addLog("小精灵太累了，体力低于 20，干不动重体力活！请先进食。");
    return;
  }
  const nextLevel = gameState.houseLevel + 1;
  const nextCost = houseUpgradeCosts[nextLevel];
  if (!nextCost) return;

  if (gameState.wood >= nextCost.wood && gameState.grass >= nextCost.grass && gameState.stone >= nextCost.stone) {
    gameState.wood -= nextCost.wood;
    gameState.grass -= nextCost.grass;
    gameState.stone -= nextCost.stone;
    gameState.houseLevel = nextLevel;
    gameState.stamina -= 15;
    addLog(`【房屋扩建成功】成功扩建为【${nextCost.name}】！可建造的房间容量提升到了 ${nextCost.capacity} 个。`);
    updateActionTime(); updateUI(); saveGame();
  }
}

// 建造房间
function buildRoom(type) {
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    addLog("小精灵太累了，体力低于 20，什么也做不了！请先让他吃点东西。");
    return;
  }

  const currentCapacity = houseUpgradeCosts[gameState.houseLevel].capacity;
  if (gameState.rooms.length >= currentCapacity) {
    addLog("房屋空间不够了！请先【扩建房屋】以解锁更多房间位置。");
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
    addLog(`【房屋改造】小精灵搭好了【${name}】！家里的舒适度提升了 ${cost.comfort} 点！`);
    updateActionTime(); updateUI(); saveGame();
  }
}

function cookFood() {
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    addLog("小精灵太累了，体力低于 20，拿不动厨具了！请先进食。");
    return;
  }
  if (!gameState.rooms.includes("厨房")) { addLog("还没有厨房，无法烹饪。"); return; }
  if (gameState.fruit < 2) { addLog("野果不够，无法烹饪(需要2个野果)。"); return; }

  gameState.fruit -= 2;
  gameState.stamina -= 10;

  const successRate = 0.4 + (gameState.cookExp / 100) * 0.6;
  if (Math.random() < successRate) {
    gameState.cooked += 1;
    addLog("【烹饪成功】小精灵成功煮出了一碗热腾腾的烤果泥！");
  } else {
    addLog("【烹饪失败】不小心把果泥煮糊了...不过烹饪经验提升了！");
  }

  if (gameState.cookExp < 100) {
    gameState.cookExp = Math.min(100, gameState.cookExp + 5);
  }
  updateActionTime(); updateUI(); saveGame();
}

function manualGather() {
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    addLog("小精灵太累了，体力低于 20，没力气出门捡树枝了！请先进食。");
    return;
  }
  gameState.stamina -= 5;
  gameState.wood += 1;
  gameState.grass += 1;
  addLog("小精灵抱着一把树枝和干草回到了家。");
  updateActionTime(); updateUI(); saveGame();
}

function craftWeapon() {
  if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    addLog("小精灵太累了，体力低于 20，没力气削木棍！请先进食。");
    return;
  }
  if (gameState.wood >= 5) {
    gameState.wood -= 5;
    gameState.weapon += 1;
    addLog("小精灵削好了一把防身的小木棍。");
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("削木棍需要 5 个树枝。");
  }
}
