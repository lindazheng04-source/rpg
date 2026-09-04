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

  // 显示舒适度和房屋信息
  const currentComfort = getHouseComfort();
  const currentHouseInfo = houseUpgradeCosts[gameState.houseLevel];
  const maxCapacity = currentHouseInfo.capacity;
  
  if (document.getElementById('house-level-info')) {
    document.getElementById('house-level-info').innerText = `${currentHouseInfo.name} (容量: ${gameState.rooms.length}/${maxCapacity})`;
  }
  if (document.getElementById('house-comfort-info')) {
    document.getElementById('house-comfort-info').innerText = `${currentComfort} 点`;
  }

  // 体力状态提示
  let statusText = "在家里歇息";
  if (gameState.isExploring) {
    statusText = "外出去远足了...";
  } else if (gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD) {
    statusText = "<span style='color:red; font-weight:bold;'>精疲力竭！只能进食休息</span>";
  } else if (gameState.stamina < STAMINA_WARNING_THRESHOLD) {
    statusText = "<span style='color:orange;'>有点疲惫，需要进食了</span>";
  }
  document.getElementById('elf-status').innerHTML = statusText;

  // 渲染已建房间
  const roomContainer = document.getElementById('room-list');
  roomContainer.innerHTML = gameState.rooms.map(r => `<span class="room-tag">${r}</span>`).join('') || '<span style="color:#888;">暂无房间</span>';

  // 渲染特殊收藏品
  const specialContainer = document.getElementById('special-item-list');
  if (specialContainer) {
    specialContainer.innerHTML = gameState.specialItems.map(item => `<span class="room-tag" style="background:#e8f4f8; border-color:#bee3f8; color:#2b6cb0;">🎁 ${item}</span>`).join('') || '<span style="color:#888;">暂无藏品</span>';
  }

  // 渲染动物列表
  const animalContainer = document.getElementById('animal-list');
  animalContainer.innerHTML = Object.keys(gameState.animals).map(k => {
    const a = gameState.animals[k];
    return `<div class="animal-card">
      <b>${a.name}</b> - 好感度: ${a.favor}% ${a.isResident ? '<span style="color:green;">(已入住)</span>' : ''}
    </div>`;
  }).join('');

  const isExhausted = gameState.stamina < STAMINA_EXHAUSTED_THRESHOLD;

  document.getElementById('btn-cook').disabled = isExhausted || !gameState.rooms.includes("厨房") || gameState.fruit < 2;
  document.getElementById('btn-eat-cooked').disabled = gameState.cooked < 1;

  // 建造房间按钮逻辑：受限于【房屋扩建容量】
  const isFullCapacity = gameState.rooms.length >= maxCapacity;
  for (let key in roomCosts) {
    const btn = document.getElementById(`btn-build-${key}`);
    if (btn) {
      const cost = roomCosts[key];
      const owned = gameState.rooms.includes(roomNames[key]);
      
      btn.disabled = isExhausted || owned || isFullCapacity || !(gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone);
      
      if (owned) {
        btn.innerText = `${roomNames[key]} (已建造)`;
      } else if (isFullCapacity) {
        btn.innerText = `建造${roomNames[key]} (容量已满，需要扩建房屋)`;
      } else {
        btn.innerText = `建造${roomNames[key]} (+${cost.comfort}舒适度 | ${cost.wood}木 ${cost.grass}草 ${cost.stone}石)`;
      }
    }
  }

  // 房屋扩建按钮逻辑
  const upgradeBtn = document.getElementById('btn-upgrade-house');
  if (upgradeBtn) {
    const nextLevel = gameState.houseLevel + 1;
    if (houseUpgradeCosts[nextLevel]) {
      const nextCost = houseUpgradeCosts[nextLevel];
      upgradeBtn.disabled = isExhausted || !(gameState.wood >= nextCost.wood && gameState.grass >= nextCost.grass && gameState.stone >= nextCost.stone);
      upgradeBtn.innerText = `扩建为【${nextCost.name}】(${nextCost.wood}木 ${nextCost.grass}草 ${nextCost.stone}石 | 容量变为 ${nextCost.capacity})`;
    } else {
      upgradeBtn.disabled = true;
      upgradeBtn.innerText = "房屋已达最大规模";
    }
  }
}
