// 玩家交互逻辑：吃食物、建造、烹饪、收集
function eatFruit() {
  if (gameState.fruit < 1) { addLog("没有野果了。"); return; }
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.fruit -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 15);
  addLog("小精灵啃了一颗酸甜的野果，恢复了 15 点体力。");
  updateUI(); saveGame();
}

function eatCooked() {
  if (gameState.cooked < 1) return;
  if (gameState.stamina >= 100) { addLog("小精灵肚子饱饱的，吃不下了。"); return; }
  gameState.cooked -= 1;
  gameState.stamina = Math.min(100, gameState.stamina + 50);
  addLog("小精灵享用了一顿香喷喷的热熟食，恢复了 50 点体力！");
  updateUI(); saveGame();
}

function buildRoom(type) {
  const name = roomNames[type];
  const cost = roomCosts[type];
  if (gameState.rooms.includes(name)) return;

  if (gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone) {
    gameState.wood -= cost.wood;
    gameState.grass -= cost.grass;
    gameState.stone -= cost.stone;
    gameState.rooms.push(name);
    addLog(`【房屋改造】小精灵搭好了【${name}】！生活越来越舒适了。`);
    updateUI(); saveGame();
  }
}

function cookFood() {
  if (!gameState.rooms.includes("厨房")) { addLog("还没有厨房，无法烹饪。"); return; }
  if (gameState.fruit < 2) { addLog("野果不够，无法烹饪(需要2个野果)。"); return; }
  if (gameState.stamina < 10) { addLog("小精灵太累了，先吃点东西休息一下吧。"); return; }

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
  updateUI(); saveGame();
}

function manualGather() {
  if (gameState.stamina < 5) { addLog("小精灵饿得搬不动树枝了，需要吃东西。"); return; }
  gameState.stamina -= 5;
  gameState.wood += 1;
  gameState.grass += 1;
  addLog("小精灵抱着一把树枝和干草回到了家。");
  updateUI(); saveGame();
}

function craftWeapon() {
  if (gameState.wood >= 5) {
    gameState.wood -= 5;
    gameState.weapon += 1;
    addLog("小精灵削好了一把防身的小木棍。");
    updateUI(); saveGame();
  } else {
    addLog("削木棍需要 5 个树枝。");
  }
}
