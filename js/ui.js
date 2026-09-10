function addLog(text) {
  const logBox = document.getElementById('log-box');
  if (!logBox) return;
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="time-stamp">[${timeStr}]</span>${text}`;
  logBox.insertBefore(entry, logBox.firstChild);
}

function updateUI() {
  if (document.getElementById('res-wood')) document.getElementById('res-wood').innerText = gameState.wood;
  if (document.getElementById('res-grass')) document.getElementById('res-grass').innerText = gameState.grass;
  if (document.getElementById('res-stone')) document.getElementById('res-stone').innerText = gameState.stone;
  if (document.getElementById('res-fruit')) document.getElementById('res-fruit').innerText = gameState.fruit;
  if (document.getElementById('res-meat')) document.getElementById('res-meat').innerText = gameState.meat;
  if (document.getElementById('res-medicine')) document.getElementById('res-medicine').innerText = gameState.medicine;
  if (document.getElementById('res-weapon')) document.getElementById('res-weapon').innerText = gameState.weapon;
  if (document.getElementById('stamina')) document.getElementById('stamina').innerText = gameState.stamina;

  // 更新各种熟食库存
  for (let key in foodRecipes) {
    const el = document.getElementById(`res-${key}`);
    if (el) el.innerText = gameState.foods[key] || 0;
  }

  const currentComfort = typeof getHouseComfort === 'function' ? getHouseComfort() : 5;
  const currentHouseInfo = houseUpgradeCosts[gameState.houseLevel] || houseUpgradeCosts[1];
  const maxCapacity = currentHouseInfo.capacity;
  
  if (document.getElementById('house-level-info')) {
    document.getElementById('house-level-info').innerText = `${currentHouseInfo.name} (容量: ${gameState.rooms.length}/${maxCapacity})`;
  }
  if (document.getElementById('house-comfort-info')) {
    document.getElementById('house-comfort-info').innerText = `${currentComfort} 点`;
  }

  const currentBag = backpackSpecs[gameState.backpack || 'none'] || backpackSpecs['none'];
  if (document.getElementById('backpack-info')) {
    document.getElementById('backpack-info').innerText = `${currentBag.name} (负重: ${currentBag.capacity})`;
  }

  // 状态显示
  let statusText = "在家里歇息";
  if (gameState.isExploring) {
    statusText = "<span style='color:#3182ce; font-weight:bold;'>🎒 带着背包外出搜集物资中...</span>";
  } else if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    statusText = "<span style='color:red; font-weight:bold;'>精疲力竭！无力出门，等待进食</span>";
  } else if (gameState.stamina < STAMINA_WARNING_THRESHOLD) {
    statusText = "<span style='color:orange;'>有点疲惫，需要补充能量</span>";
  }
  if (document.getElementById('elf-status')) document.getElementById('elf-status').innerHTML = statusText;

  // 房间与藏品
  const roomContainer = document.getElementById('room-list');
  if (roomContainer) {
    roomContainer.innerHTML = gameState.rooms.map(r => `<span class="room-tag">${r}</span>`).join('') || '<span style="color:#888;">暂无房间</span>';
  }

  const specialContainer = document.getElementById('special-item-list');
  if (specialContainer) {
    specialContainer.innerHTML = (gameState.specialItems || []).map(item => `<span class="room-tag" style="background:#e8f4f8; border-color:#bee3f8; color:#2b6cb0;">🎁 ${item}</span>`).join('') || '<span style="color:#888;">暂无藏品</span>';
  }

  // 动物列表
  const animalContainer = document.getElementById('animal-list');
  if (animalContainer && gameState.animals) {
    animalContainer.innerHTML = Object.keys(gameState.animals).map(k => {
      const a = gameState.animals[k];
      return `<div class="animal-card">
        <b>${a.name}</b> - 好感度: ${a.favor}% ${a.isResident ? '<span style="color:green;">(已入住)</span>' : ''}
      </div>`;
    }).join('');
  }

  // 烹饪按钮与单独熟练度更新
  const hasKitchen = gameState.rooms.includes("厨房");
  for (let key in foodRecipes) {
    const recipe = foodRecipes[key];
    const cookBtn = document.getElementById(`btn-cook-${key}`);
    const eatBtn = document.getElementById(`btn-eat-${key}`);
    const expSpan = document.getElementById(`exp-${key}`);

    const exp = gameState.recipeExp[key] || 0;
    if (expSpan) expSpan.innerText = `${exp}%`;

    if (cookBtn) {
      const hasRes = gameState.fruit >= recipe.cost.fruit && gameState.meat >= recipe.cost.meat;
      cookBtn.disabled = !hasKitchen || !hasRes;
    }
    if (eatBtn) {
      eatBtn.disabled = (gameState.foods[key] || 0) < 1;
    }
  }

  //展示季节与天气
  // ui_2.js updateUI() 函数中：
  const seasonCfg = SEASONS[gameState.season] || SEASONS.spring;
  const weatherCfg = WEATHERS[gameState.weather] || WEATHERS.sunny;

  if (document.getElementById('environment-info')) {
    document.getElementById('environment-info').innerHTML = `
    <b>${seasonCfg.name}</b> 第 ${gameState.seasonDay || 1} 天 
    | <span style="color:#8c6b52; cursor:help;" title="${weatherCfg.desc}">${weatherCfg.name}</span>
    ${!weatherCfg.canGather ? ' <span style="color:#e53e3e; font-size:0.8rem;">(恶劣天气禁止出行)</span>' : ''}
    `;
  }

  // 基础食用/制作按钮
  if (document.getElementById('btn-eat-fruit')) document.getElementById('btn-eat-fruit').disabled = gameState.fruit < 1;
  if (document.getElementById('btn-eat-meat')) document.getElementById('btn-eat-meat').disabled = gameState.meat < 1;
  if (document.getElementById('btn-use-medicine')) document.getElementById('btn-use-medicine').disabled = gameState.medicine < 1;
  if (document.getElementById('btn-craft-medicine')) document.getElementById('btn-craft-medicine').disabled = gameState.grass < 3 || gameState.fruit < 1;
  if (document.getElementById('btn-weapon')) document.getElementById('btn-weapon').disabled = gameState.wood < 5;

  // 背包按钮控制
  ['straw', 'leather', 'sturdy'].forEach(type => {
    const btn = document.getElementById(`btn-bag-${type}`);
    if (btn) {
      const spec = backpackSpecs[type];
      const isEquipped = gameState.backpack === type;
      const needMeat = spec.meat || 0;
      btn.disabled = isEquipped || !(gameState.wood >= spec.wood && gameState.grass >= spec.grass && gameState.meat >= needMeat);
    }
  });

  // 房屋与建筑控制
  const isFullCapacity = gameState.rooms.length >= maxCapacity;
  for (let key in roomCosts) {
    const btn = document.getElementById(`btn-build-${key}`);
    if (btn) {
      const cost = roomCosts[key];
      const owned = gameState.rooms.includes(roomNames[key]);
      btn.disabled = owned || isFullCapacity || !(gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone);
    }
  }

  const upgradeBtn = document.getElementById('btn-upgrade-house');
  if (upgradeBtn) {
    const nextLevel = gameState.houseLevel + 1;
    if (houseUpgradeCosts[nextLevel]) {
      const nextCost = houseUpgradeCosts[nextLevel];
      upgradeBtn.disabled = !(gameState.wood >= nextCost.wood && gameState.grass >= nextCost.grass && gameState.stone >= nextCost.stone);
    } else {
      upgradeBtn.disabled = true;
    }
  }
}
