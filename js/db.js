// 数据存储配置
const SAVE_KEY = 'elf_game_v2';

// 统一数据管理对象
const DB = {
  // 保存游戏数据
  save(data) {
    try {
      data.lastTime = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("保存失败:", e);
    }
  },


  // 加载数据 (自动合并默认值，防止修改代码新增字段后报错)
  load(defaultState) {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return defaultState;

      const parsed = JSON.parse(saved);

      // 深层或表层合并：确保旧存档中缺失的新字段能自动使用 defaultState 的默认值
      // db.js 中的 load 方法修改
      const mergedState = {
        ...defaultState,
        ...parsed,
        foods: { ...defaultState.foods, ...(parsed.foods || {}) },
        recipeExp: { ...defaultState.recipeExp, ...(parsed.recipeExp || {}) },
        animals: { ...defaultState.animals, ...(parsed.animals || {}) }
      };

      return mergedState;
    } catch (e) {
      console.error("读取存档失败，加载默认数据:", e);
      return defaultState;
    }
  },

  // 1. 补全技能列表（如果旧档没有 skills 字段，或缺少新新增的技能 key）
    if (!gameState.skills) {
      gameState.skills = {};
    }
    
    // 确保 SKILL_TYPES 中定义的每个技能在 gameState 中都存在
    Object.keys(SKILL_TYPES).forEach(key => {
      if (!gameState.skills[key]) {
        gameState.skills[key] = { level: 1, exp: 0 };
      }
    });

    // 2. 补全技能点与已解锁天赋
    if (typeof gameState.skillPoints !== "number") {
      gameState.skillPoints = 0;
    }

    if (!Array.isArray(gameState.unlockedTalents)) {
      gameState.unlockedTalents = [];
    }

    // 3. 补全道具背包对象（供洗点道具使用）
    if (!gameState.items) {
      gameState.items = {};
    }

  // 清除/重置存档
  clear() {
    localStorage.removeItem(SAVE_KEY);
  }
};
