const mockStorage = {
  stats: {
    totalSaved: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    promptsOptimized: 0,
    platformTokens: {},
    weeklyStats: {}
  },
  history: []
};

function normalizeStats(stats) {
  return {
    totalSaved: stats?.totalSaved ?? 0,
    totalInputTokens: stats?.totalInputTokens ?? 0,
    totalOutputTokens: stats?.totalOutputTokens ?? 0,
    promptsOptimized: stats?.promptsOptimized ?? 0,
    platformTokens: stats?.platformTokens ?? {},
    weeklyStats: stats?.weeklyStats ?? {},
  }
}

// Simulates 'COMPRESS_PROMPT' logic
function simulateOptimize(prompt, originalTokens, compressedTokens, hostname) {
  const newTokens = compressedTokens;
  const saved = Math.max(0, originalTokens - compressedTokens);
  
  let platform = 'Unknown';
  if (hostname.includes('claude.ai')) platform = 'Claude';
  else if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) platform = 'ChatGPT';
  else if (hostname.includes('gemini.google.com')) platform = 'Gemini';
  else if (hostname.includes('deepseek.com')) platform = 'DeepSeek';

  const stats = normalizeStats(mockStorage.stats);

  const newHistoryItem = {
    timestamp: Date.now(),
    originalTokens,
    compressedTokens,
    newTokens,
    saved,
    platform,
    promptSummary: prompt.slice(0, 60).replace(/\s+/g, ' ').trim(),
  };

  const history = mockStorage.history ?? [];
  const newHistory = [newHistoryItem, ...history].slice(0, 50);

  const newPlatformTokens = { ...(stats.platformTokens ?? {}) };
  newPlatformTokens[platform] = (newPlatformTokens[platform] || 0) + newTokens;

  const nowLocal = new Date()
  const offset = nowLocal.getTimezoneOffset()
  const localDate = new Date(nowLocal.getTime() - (offset * 60 * 1000))
  const dateStr = localDate.toISOString().split('T')[0]
  
  const newWeeklyStats = { ...(stats.weeklyStats ?? {}) };
  newWeeklyStats[dateStr] = (newWeeklyStats[dateStr] || 0) + saved;

  mockStorage.stats = {
    totalSaved: stats.totalSaved + saved,
    totalInputTokens: stats.totalInputTokens + originalTokens,
    totalOutputTokens: stats.totalOutputTokens + newTokens,
    promptsOptimized: stats.promptsOptimized + 1,
    platformTokens: newPlatformTokens,
    weeklyStats: newWeeklyStats,
  };
  mockStorage.history = newHistory;
}

// Simulates 'GET_STATS' logic
function getStats() {
  const stats = normalizeStats(mockStorage.stats);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const jsDayToMonSun = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfThisWeek = startOfToday - (jsDayToMonSun * 24 * 60 * 60 * 1000);
  const startOfLastWeek = startOfThisWeek - (7 * 24 * 60 * 60 * 1000);

  let thisWeekSum = 0;
  let lastWeekSum = 0;

  const wStats = stats.weeklyStats || {};
  for (const [dateStr, savedTokens] of Object.entries(wStats)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const time = new Date(year, month - 1, day).getTime()
    if (time >= startOfThisWeek) {
      thisWeekSum += savedTokens;
    } else if (time >= startOfLastWeek && time < startOfThisWeek) {
      lastWeekSum += savedTokens;
    }
  }

  let computedTrend = 0;
  if (lastWeekSum === 0) {
    computedTrend = thisWeekSum > 0 ? 100 : 0;
  } else {
    computedTrend = Math.round(((thisWeekSum - lastWeekSum) / lastWeekSum) * 100);
  }

  return {
    totalSaved: stats.totalSaved,
    promptsOptimized: stats.promptsOptimized,
    platformTokens: stats.platformTokens,
    weeklyStats: stats.weeklyStats,
    trend: computedTrend,
    history: mockStorage.history.map(h => ({ summary: h.promptSummary, saved: h.saved, platform: h.platform })),
  };
}

console.log("=== Initial State ===");
console.log(JSON.stringify(getStats(), null, 2));

console.log("\n=== Simulating 1st Prompt on Gemini ===");
simulateOptimize("Please explain quantum physics in simple terms.", 150, 50, "gemini.google.com");
console.log(JSON.stringify(getStats(), null, 2));

console.log("\n=== Simulating 2nd Prompt on Gemini ===");
simulateOptimize("How does photosynthesis work step by step?", 200, 80, "gemini.google.com");
console.log(JSON.stringify(getStats(), null, 2));
