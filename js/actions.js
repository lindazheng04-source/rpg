function updateActionTime() {
  gameState.lastActionTime = Date.now();
}

function eatFruit() {
  if (gameState.fruit < 1) { addLog("没有野果了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.fruit -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 15);
  addLog("你喂小精灵啃了一颗野果，恢复了 15 点体力。");
  updateActionTime(); updateUI(); saveGame();
}

function eatCooked() {
  if (gameState.cooked < 1) { addLog("没有熟食了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.cooked -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 50);
  addLog("你给小精灵吃了一份热熟食，恢复了 50 点体力！");
  updateActionTime(); updateUI(); saveGame();
}

// 使用药品给小精灵快速大额恢复体力/疗伤
function useMedicine() {
  if (gameState.medicine < 1) { addLog("没有药品了，请先用药草制作！"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵身体棒棒的，不需要用药。"); return; }
  gameState.medicine -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 80);
  addLog("【使用药品】你给小精灵敷上了神奇草药膏，体力瞬间恢复了 80 点！");
  updateActionTime(); updateUI(); saveGame();
}

// 制作药品（需 2 份药草）
function craftMedicine() {
  if (gameState.herb < 2) { addLog("制作药品需要 2 份药草。"); return; }
  gameState.herb -= 2;
  gameState.medicine += 1;
  addLog("【玩家制药】你精心研磨药草，制成了一份草药膏。");
  updateActionTime(); updateUI(); saveGame();
}

function toggleAutoEat() {
  gameState.autoEat = !gameState.autoEat;
  addLog(`自动进食功能已 ${gameState.autoEat ? '开启' : '关闭'}。`);
  updateUI(); saveGame();
}

function craftWeapon() {
  if (gameState.wood < 5) { addLog("制作小木棍需要 5 个树枝。"); return; }
  gameState.wood -= 5;
  gameState.weapon += 1;
  addLog("【玩家制作】你削好了一把防身的小木棍，小精灵随时可以带去野外了！");
  updateActionTime(); updateUI(); saveGame();
}

// 烹饪逻辑支持“烤肉”与“烤果泥”
function cookFood() {
  if (!gameState.rooms.includes("厨房")) { addLog("还没有厨房，无法烹饪。"); return; }
  
  if (gameState.meat >= 1) {
    // 优先烹饪肉类，1个肉可做1份大餐熟食
    gameState.meat -= 1;
    gameState.cooked += 1;
    addLog("【玩家烹饪】你把鲜肉烤得香气四溢，做成了一份丰盛的烤肉大餐！");
  } else if (gameState.fruit >= 2) {
    gameState.fruit -= 2;
    const successRate = 0.4 + (gameState.cookExp / 100) * 0.6;
    if (Math.random() < successRate) {
      gameState.cooked += 1;
      addLog("【玩家烹饪】你煮出了一碗热腾腾的烤果泥！");
    } else {
      addLog("【烹饪失败】不小心把果泥煮糊了...但积累了烹饪经验！");
    }
    if (gameState.cookExp < 100) gameState.cookExp = Math.min(100, gameState.cookExp + 5);
  } else {
    addLog("食材不足，烹饪需要 1 份肉类 或 2 个野果。");
    return;
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
    addLog(`【房屋扩建】你帮小精灵把家扩建为了【${nextCost.name}】！`);
    updateActionTime(); updateUI(); saveGame();
  }
}

function buildRoom(type) {
  const currentCapacity = houseUpgradeCosts[gameState.houseLevel].capacity;
  if (gameState.rooms.length >= currentCapacity) {
    addLog("房屋空间不够了！请先扩建房屋。");
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
    addLog(`【家园建造】你为小精灵盖好了【${name}】！舒适度提升了 ${cost.comfort} 点。`);
    updateActionTime(); updateUI(); saveGame();
  }
}
