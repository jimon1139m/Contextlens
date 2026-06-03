import { TrendingUp, MessageCircle } from 'lucide-react';
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
  trend: number;
}

import type { ReactNode } from 'react';

// Platform color + icon config
const PLATFORM_STYLES: Record<string, { bg: string; text: string; icon: ReactNode }> = {
  ChatGPT: { 
    bg: 'bg-emerald-500/20', text: 'text-emerald-400', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829V6.0505a.0757.0757 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685zm.804-6.425a4.4755 4.4755 0 0 1 2.8764 1.0407l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052V6.8344a4.504 4.504 0 0 1 4.4945-4.4944zM10.7408 3.0298a4.485 4.485 0 0 1 2.3655 1.9728v-5.677a.7664.7664 0 0 0-.3879-.6765L6.904 1.2948l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7865A4.504 4.504 0 0 1 10.7408 3.0298zM15.16 9.544l-2.8859-1.666L9.388 9.544v3.332l2.886 1.666 2.886-1.666z"/></svg>
  },
  Claude: { 
    bg: 'bg-orange-500/20', text: 'text-orange-400', 
    icon: <span className="font-serif italic font-bold text-[14px] leading-none text-[#D97757]">C</span>
  },
  Gemini: { 
    bg: 'bg-cyan-500/20', text: 'text-cyan-400', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24c0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12 0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12z"/></svg> 
  },
  DeepSeek: { 
    bg: 'bg-blue-500/20', text: 'text-blue-400', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM8 7H14.5C17.5376 7 20 9.46243 20 12.5C20 15.5376 17.5376 18 14.5 18H8V7ZM10.5 9.5V15.5H14.5C16.1569 15.5 17.5 14.1569 17.5 12.5C17.5 10.8431 16.1569 9.5 14.5 9.5H10.5Z"/></svg>
  },
  Perplexity: { 
    bg: 'bg-teal-500/20', text: 'text-teal-400', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 14h4v4h-4zM10 6h4v4h-4zM6 10h4v4H6zM14 10h4v4h-4z" fill="currentColor"/></svg>
  },
  Unknown: { 
    bg: 'bg-gray-500/20', text: 'text-gray-400', 
    icon: <MessageCircle size={14} /> 
  },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatK(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}



// Mini donut SVG for avg compression
function MiniDonut({ percent }: { percent: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const filled = (percent / 100) * c;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="ml-2">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
      <circle
        cx="18" cy="18" r={r} fill="none"
        stroke="url(#donutGrad)" strokeWidth="4"
        strokeDasharray={`${filled} ${c - filled}`}
        strokeDashoffset={c / 4}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b026ff" />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Stats({
  totalSaved,
  promptsOptimized,
  avgCompression,
  weeklyData,
  history = [],
  trend,
}: StatsProps) {
  const maxWeekly = Math.max(...weeklyData, 1);

  // Compute y-axis labels
  const yStep = maxWeekly > 0 ? Math.ceil(maxWeekly / 3 / 100) * 100 || 1 : 1;
  const yLabels = [0, yStep, yStep * 2, yStep * 3].filter(v => v <= maxWeekly * 1.2);

  return (
    <div className="flex flex-col space-y-3">
      {/* ── Total Tokens Saved ── */}
      <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-neon-purple via-brand-500 to-neon-blue shadow-[0_0_20px_rgba(176,38,255,0.3)]">
        <div className="bg-gray-900/90 backdrop-blur-md rounded-xl px-5 py-4">
          <span className="text-gray-400 text-xs font-medium tracking-wide">Total Tokens Saved:</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {totalSaved.toLocaleString()}
            </span>
            {trend !== 0 && (
              <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                trend > 0
                  ? 'text-emerald-400 bg-emerald-500/15'
                  : 'text-red-400 bg-red-500/15'
              }`}>
                <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Prompts Optimized + Avg Compression ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <span className="text-gray-400 text-xs font-medium tracking-wide block mb-1">Prompts Optimized:</span>
          <span className="text-3xl font-extrabold text-white">{promptsOptimized}</span>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <span className="text-gray-400 text-xs font-medium tracking-wide block mb-1">Avg Compression:</span>
          <div className="flex items-center">
            <span className="text-3xl font-extrabold text-white">{avgCompression.toFixed(1)}%</span>
            <MiniDonut percent={avgCompression} />
          </div>
        </div>
      </div>

      {/* ── Weekly Token Savings Bar Chart ── */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Weekly Token Savings</span>
          <span className="text-[10px] text-gray-500 font-medium">
            0 - {formatK(Math.ceil(maxWeekly / 100) * 100)} Tokens
          </span>
        </div>

        {/* Chart area */}
        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex flex-col-reverse justify-between pr-2 pb-5" style={{ height: 100 }}>
            {yLabels.map((v, i) => (
              <span key={i} className="text-[9px] text-gray-500 leading-none">{formatK(v)}</span>
            ))}
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end justify-between gap-1.5" style={{ height: 100 }}>
            {weeklyData.map((val, i) => {
              const pct = maxWeekly > 0 ? (val / maxWeekly) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  {/* Value label above bar */}
                  <span className="text-[9px] text-gray-300 font-semibold mb-1 min-h-[12px]">
                    {val > 0 ? formatK(val) : ''}
                  </span>
                  {/* Bar container */}
                  <div className="w-full flex justify-center" style={{ height: 80 }}>
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-brand-600 via-neon-purple/80 to-neon-blue/70 transition-all duration-500 hover:opacity-80 hover:shadow-[0_0_12px_rgba(176,38,255,0.6)]"
                      style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  {/* Day label */}
                  <span className="text-[10px] text-gray-400 mt-1.5 font-medium">{DAY_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Optimizations ── */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <span className="text-sm font-semibold text-white block mb-3">Recent Optimizations</span>
        {history.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {history.slice(0, 10).map((item, idx) => {
              const platform = item.platform || 'Unknown';
              const style = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Unknown;
              const savedPct = item.originalTokens > 0
                ? Math.round((item.saved / item.originalTokens) * 100)
                : 0;
              const summary = item.promptSummary || `Prompt ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {/* Platform icon circle */}
                  <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center text-sm shrink-0`}>
                    {style.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-200 truncate">{summary}</div>
                    <div className={`text-[10px] ${style.text}`}>{item.saved} tokens saved</div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white">{item.saved}</div>
                    <div className="text-[10px] text-gray-400">{savedPct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 py-4">
            No optimizations yet. Start chatting with an AI platform!
          </div>
        )}
      </div>
    </div>
  );
}
