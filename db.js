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
      const mergedState = {
        ...defaultState,
        ...parsed,
        // 针对对象类型的嵌套数据进行合并保护
        animals: { ...defaultState.animals, ...(parsed.animals || {}) }
      };

      return mergedState;
    } catch (e) {
      console.error("读取存档失败，加载默认数据:", e);
      return defaultState;
    }
  },

  // 清除/重置存档
  clear() {
    localStorage.removeItem(SAVE_KEY);
  }
};
