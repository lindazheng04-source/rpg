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
  document.getElementById('res-cooked').innerText = gameState.cooked;
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

  // 新增：背包展示
  const currentBag = backpackSpecs[gameState.backpack || 'none'];
  if (document.getElementById('backpack-info')) {
    document.getElementById('backpack-info').innerText = `${currentBag.name} (负重上限: ${currentBag.capacity})`;
  }

  // 状态显示
  let statusText = "在家里歇息";
  if (gameState.isExploring) {
    statusText = "<span style='color:#3182ce; font-weight:bold;'>🎒 背着背包外出搜集物资中...</span>";
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
  document.getElementById('btn-cook').disabled = !gameState.rooms.includes("厨房") || gameState.fruit < 2;
  document.getElementById('btn-weapon').disabled = gameState.wood < 5;
  document.getElementById('btn-eat-fruit').disabled = gameState.fruit < 1;
  document.getElementById('btn-eat-cooked').disabled = gameState.cooked < 1;

  // 新增：背包制作按钮状态更新
  ['straw', 'leather', 'sturdy'].forEach(type => {
    const btn = document.getElementById(`btn-bag-${type}`);
    if (btn) {
      const spec = backpackSpecs[type];
      const isEquipped = gameState.backpack === type;
      btn.disabled = isEquipped || !(gameState.wood >= spec.wood && gameState.grass >= spec.grass);
      btn.innerText = isEquipped ? `${spec.name} (已装备)` : `缝制${spec.name} (${spec.grass}草 ${spec.wood}木 | 负重${spec.capacity})`;
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
