import { BarChart3, Gauge, Send, TrendingDown, Scissors } from 'lucide-react';
import type { OptimizationHistoryItem } from '../../shared/types';

interface StatsProps {
  totalSaved: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  promptsOptimized: number;
  avgCompression: number;
  weeklyData: number[];
  history?: OptimizationHistoryItem[];
  platformTokens: Record<string, number>;
}

export default function Stats({
  totalSaved,
  totalInputTokens,
  totalOutputTokens,
  promptsOptimized,
  avgCompression,
  weeklyData,
  history,
  platformTokens,
}: StatsProps) {
  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-2 z-10">Tokens Saved</span>
        <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-neon-purple drop-shadow-[0_0_15px_rgba(176,38,255,0.4)] z-10 transition-transform duration-300 group-hover:scale-105">
          {totalSaved.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col hover:bg-white/10 transition-colors duration-300 group">
          <div className="flex items-center space-x-2 text-gray-400 mb-3">
            <Gauge size={14} className="text-brand-300 group-hover:animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wide">User Tokens</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{totalInputTokens.toLocaleString()}</span>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col hover:bg-white/10 transition-colors duration-300 group">
          <div className="flex items-center space-x-2 text-gray-400 mb-3">
            <Send size={14} className="text-neon-blue group-hover:animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wide">Sent Tokens</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{totalOutputTokens.toLocaleString()}</span>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col hover:bg-white/10 transition-colors duration-300 group">
          <div className="flex items-center space-x-2 text-gray-400 mb-3">
            <Scissors size={14} className="text-neon-pink group-hover:animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wide">Optimized</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{promptsOptimized}</span>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col hover:bg-white/10 transition-colors duration-300 group">
          <div className="flex items-center space-x-2 text-gray-400 mb-3">
            <TrendingDown size={14} className="text-neon-blue group-hover:animate-bounce" />
            <span className="text-xs font-medium uppercase tracking-wide">Avg Saved</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{avgCompression.toFixed(1)}%</span>
        </div>
      </div>

      {Object.keys(platformTokens).length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3 text-gray-300">
            <span className="text-xs font-medium uppercase tracking-wider">AI Platform Sent Tokens</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(platformTokens).map(([platform, tokens]) => (
              <div key={platform} className="bg-white/10 px-3 py-1.5 rounded-md flex items-center justify-between flex-1 min-w-[100px]">
                <span className="text-xs text-gray-300 font-medium">{platform}</span>
                <span className="text-xs font-bold text-brand-300">{tokens.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-4 text-gray-300">
          <span className="text-xs font-medium uppercase tracking-wider">This Week</span>
          <BarChart3 size={16} className="text-brand-400" />
        </div>
        <div className="flex items-end justify-between h-16 space-x-1.5">
          {weeklyData.map((val, i) => (
            <div key={i} className="w-full bg-white/5 rounded-t-sm flex items-end justify-center group relative overflow-hidden" style={{ height: '100%' }}>
              <div
                className="w-full bg-gradient-to-t from-brand-600 to-neon-purple rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80 group-hover:shadow-[0_0_10px_rgba(176,38,255,0.6)]"
                style={{ height: `${(val / maxWeekly) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3 text-gray-300">
          <span className="text-xs font-medium uppercase tracking-wider">Recent Optimizations</span>
        </div>
        {history && history.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {history.map((item, idx) => {
              const spentOnContext = Math.max(0, item.newTokens - item.compressedTokens);
              return (
                <div key={idx} className="flex flex-col text-xs p-2 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <div className="flex space-x-2 text-right">
                      <span className="text-gray-500 line-through">{item.originalTokens}</span>
                      <span className="text-gray-200">➔</span>
                      <span className="text-brand-300 font-bold">{item.newTokens}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neon-pink flex items-center"><Scissors size={10} className="mr-1"/> -{item.saved} saved</span>
                    {spentOnContext > 0 && (
                      <span className="text-neon-blue flex items-center">+{spentOnContext} spent (RAG)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 py-2">No recent optimizations</div>
        )}
      </div>
    </div>
  );
}
