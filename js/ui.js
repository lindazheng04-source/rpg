function addLog(text) {
  const logBox = document.getElementById('log-box');
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="time-stamp">[${timeStr}]</span>${text}`;
  logBox.insertBefore(entry, logBox.firstChild);
}

function updateUI() {
  document.getElementById('res-wood').innerText = gameState.wood;
  document.getElementById('res-grass').innerText = gameState.grass;
  document.getElementById('res-stone').innerText = gameState.stone;
  document.getElementById('res-fruit').innerText = gameState.fruit;
  if (document.getElementById('res-meat')) document.getElementById('res-meat').innerText = gameState.meat;
  document.getElementById('res-cooked').innerText = gameState.cooked;
  if (document.getElementById('res-medicine')) document.getElementById('res-medicine').innerText = gameState.medicine;
  document.getElementById('res-weapon').innerText = gameState.weapon;
  document.getElementById('stamina').innerText = gameState.stamina;
  document.getElementById('cook-exp').innerText = gameState.cookExp;

  const currentComfort = typeof getHouseComfort === 'function' ? getHouseComfort() : 5;
  const currentHouseInfo = houseUpgradeCosts[gameState.houseLevel];
  const maxCapacity = currentHouseInfo.capacity;
  
  if (document.getElementById('house-level-info')) {
    document.getElementById('house-level-info').innerText = `${currentHouseInfo.name} (容量: ${gameState.rooms.length}/${maxCapacity})`;
  }
  if (document.getElementById('house-comfort-info')) {
    document.getElementById('house-comfort-info').innerText = `${currentComfort} 点`;
  }

  const currentBag = backpackSpecs[gameState.backpack || 'none'];
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
  document.getElementById('elf-status').innerHTML = statusText;

  // 房间与藏品
  const roomContainer = document.getElementById('room-list');
  roomContainer.innerHTML = gameState.rooms.map(r => `<span class="room-tag">${r}</span>`).join('') || '<span style="color:#888;">暂无房间</span>';

  const specialContainer = document.getElementById('special-item-list');
  if (specialContainer) {
    specialContainer.innerHTML = (gameState.specialItems || []).map(item => `<span class="room-tag" style="background:#e8f4f8; border-color:#bee3f8; color:#2b6cb0;">🎁 ${item}</span>`).join('') || '<span style="color:#888;">暂无藏品</span>';
  }

  // 动物列表
  const animalContainer = document.getElementById('animal-list');
  animalContainer.innerHTML = Object.keys(gameState.animals).map(k => {
    const a = gameState.animals[k];
    return `<div class="animal-card">
      <b>${a.name}</b> - 好感度: ${a.favor}% ${a.isResident ? '<span style="color:green;">(已入住)</span>' : ''}
    </div>`;
  }).join('');

  // 基础按钮控制
  if (document.getElementById('btn-eat-meat')) document.getElementById('btn-eat-meat').disabled = gameState.meat < 1;
  if (document.getElementById('btn-use-medicine')) document.getElementById('btn-use-medicine').disabled = gameState.medicine < 1;
  if (document.getElementById('btn-craft-medicine')) document.getElementById('btn-craft-medicine').disabled = gameState.grass < 3 || gameState.fruit < 1;
  
  document.getElementById('btn-cook').disabled = !gameState.rooms.includes("厨房") || gameState.fruit < 1 || gameState.meat < 1;
  document.getElementById('btn-weapon').disabled = gameState.wood < 5;
  document.getElementById('btn-eat-fruit').disabled = gameState.fruit < 1;
  document.getElementById('btn-eat-cooked').disabled = gameState.cooked < 1;

  // 背包按钮控制
  ['straw', 'leather', 'sturdy'].forEach(type => {
    const btn = document.getElementById(`btn-bag-${type}`);
    if (btn) {
      const spec = backpackSpecs[type];
      const isEquipped = gameState.backpack === type;
      const needMeat = spec.meat || 0;
      btn.disabled = isEquipped || !(gameState.wood >= spec.wood && gameState.grass >= spec.grass && gameState.meat >= needMeat);
      
      let costText = `${spec.grass}草 ${spec.wood}木`;
      if (needMeat > 0) costText += ` ${needMeat}肉`;
      btn.innerText = isEquipped ? `${spec.name} (已装备)` : `缝制${spec.name} (${costText} | 负重${spec.capacity})`;
    }
  });

  // 房间与扩建控制
  const isFullCapacity = gameState.rooms.length >= maxCapacity;
  for (let key in roomCosts) {
    const btn = document.getElementById(`btn-build-${key}`);
    if (btn) {
      const cost = roomCosts[key];
      const owned = gameState.rooms.includes(roomNames[key]);
      
      btn.disabled = owned || isFullCapacity || !(gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone);
      
      if (owned) {
        btn.innerText = `${roomNames[key]} (已建造)`;
      } else if (isFullCapacity) {
        btn.innerText = `建造${roomNames[key]} (空间已满，请扩建)`;
      } else {
        btn.innerText = `建造${roomNames[key]} (+${cost.comfort}舒适 | ${cost.wood}木 ${cost.grass}草 ${cost.stone}石)`;
      }
    }
  }

  const upgradeBtn = document.getElementById('btn-upgrade-house');
  if (upgradeBtn) {
    const nextLevel = gameState.houseLevel + 1;
    if (houseUpgradeCosts[nextLevel]) {
      const nextCost = houseUpgradeCosts[nextLevel];
      upgradeBtn.disabled = !(gameState.wood >= nextCost.wood && gameState.grass >= nextCost.grass && gameState.stone >= nextCost.stone);
      upgradeBtn.innerText = `扩建为【${nextCost.name}】(${nextCost.wood}木 ${nextCost.grass}草 ${nextCost.stone}石 | 容量: ${nextCost.capacity})`;
    } else {
      upgradeBtn.disabled = true;
      upgradeBtn.innerText = "房屋已达最大规模";
    }
  }
}
