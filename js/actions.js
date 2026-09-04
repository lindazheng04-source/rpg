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

function eatCooked() {
  if (gameState.cooked < 1) { addLog("没有熟食了，去厨房做一份吧！"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.cooked -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 50);
  addLog("你给小精灵端上了一碗香喷喷的热熟食，恢复了 50 点体力！");
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
  addLog("【玩家制作】你利用树枝为小精灵削好了一把防身的小木棍！");
  updateActionTime(); updateUI(); saveGame();
}

// 新增：玩家制作/装备背包
function craftBackpack(type) {
  const spec = backpackSpecs[type];
  if (!spec) return;
  if (gameState.backpack === type) {
    addLog(`小精灵已经装备了【${spec.name}】。`);
    return;
  }

  if (gameState.wood >= spec.wood && gameState.grass >= spec.grass) {
    gameState.wood -= spec.wood;
    gameState.grass -= spec.grass;
    gameState.backpack = type;
    addLog(`【制作装备】你成功缝制了【${spec.name}】并给小精灵背上！出远门负重上限提升至 ${spec.capacity} 点。`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("制作该背包的材料不足。");
  }
}

function cookFood() {
  if (!gameState.rooms.includes("厨房")) { addLog("还没有厨房，无法烹饪。请先为小精灵建造厨房。"); return; }
  if (gameState.fruit < 2) { addLog("野果不够，烹饪需要 2 个野果。"); return; }

  gameState.fruit -= 2;
  const successRate = 0.4 + (gameState.cookExp / 100) * 0.6;
  if (Math.random() < successRate) {
    gameState.cooked += 1;
    addLog("【玩家烹饪】你成功煮出了一碗热腾腾的烤果泥！");
  } else {
    addLog("【烹饪失败】不小心把果泥煮糊了...不过你的烹饪经验提升了！");
  }

  if (gameState.cookExp < 100) {
    gameState.cookExp = Math.min(100, gameState.cookExp + 5);
  }
  updateActionTime(); updateUI(); saveGame();
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
    addLog(`【房屋扩建】你帮小精灵把家扩建为了【${nextCost.name}】！可以建造更多房间了。`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("扩建物资不足。");
  }
}

function buildRoom(type) {
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
    addLog(`【家园建造】你为小精灵盖好了【${name}】！家里的舒适度提升了 ${cost.comfort} 点！`);
    updateActionTime(); updateUI(); saveGame();
  } else {
    addLog("建造物资不足。");
  }
}
