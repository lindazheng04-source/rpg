// 日志打印与 UI 界面更新
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
  document.getElementById('elf-status').innerText = gameState.isExploring ? "外出去远足了..." : "在家里歇息";

  // 渲染房间列表
  const roomContainer = document.getElementById('room-list');
  roomContainer.innerHTML = gameState.rooms.map(r => `<span class="room-tag">${r}</span>`).join('');

  // 渲染动物列表
  const animalContainer = document.getElementById('animal-list');
  animalContainer.innerHTML = Object.keys(gameState.animals).map(k => {
    const a = gameState.animals[k];
    return `<div class="animal-card">
      <b>${a.name}</b> - 好感度: ${a.favor}% ${a.isResident ? '<span style="color:green;">(已入住)</span>' : ''}
    </div>`;
  }).join('');

  // 按钮禁用与状态控制
  document.getElementById('btn-cook').disabled = !gameState.rooms.includes("厨房") || gameState.fruit < 2;
  document.getElementById('btn-eat-cooked').disabled = gameState.cooked < 1;

  for (let key in roomCosts) {
    const btn = document.getElementById(`btn-build-${key}`);
    if (btn) {
      const cost = roomCosts[key];
      const owned = gameState.rooms.includes(roomNames[key]);
      btn.disabled = owned || !(gameState.wood >= cost.wood && gameState.grass >= cost.grass && gameState.stone >= cost.stone);
      btn.innerText = owned ? `${roomNames[key]} (已建造)` : `建造${roomNames[key]} (${cost.wood}木 ${cost.grass}草 ${cost.stone}石)`;
    }
  }
}
