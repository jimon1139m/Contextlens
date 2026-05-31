import { BarChart3, TrendingDown, Scissors } from 'lucide-react';

interface StatsProps {
  totalSaved: number;
  promptsOptimized: number;
  avgCompression: number;
  weeklyData: number[];
}

export default function Stats({ totalSaved, promptsOptimized, avgCompression, weeklyData }: StatsProps) {
  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div className="flex flex-col space-y-4">
      {/* Hero Stat */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col items-center justify-center">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Tokens Saved</span>
        <span className="text-4xl font-bold text-brand-500">{totalSaved.toLocaleString()}</span>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex flex-col">
          <div className="flex items-center space-x-2 text-gray-400 mb-2">
            <Scissors size={14} />
            <span className="text-xs">Optimized</span>
          </div>
          <span className="text-xl font-semibold">{promptsOptimized}</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex flex-col">
          <div className="flex items-center space-x-2 text-gray-400 mb-2">
            <TrendingDown size={14} />
            <span className="text-xs">Avg Compression</span>
          </div>
          <span className="text-xl font-semibold">{avgCompression.toFixed(1)}%</span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3 text-gray-400">
          <span className="text-xs font-medium">This Week</span>
          <BarChart3 size={14} />
        </div>
        <div className="flex items-end justify-between h-16 space-x-1">
          {weeklyData.map((val, i) => (
            <div key={i} className="w-full bg-gray-700 rounded-t-sm flex items-end justify-center group relative" style={{ height: '100%' }}>
              <div 
                className="w-full bg-brand-600 rounded-t-sm transition-all duration-300 group-hover:bg-brand-500" 
                style={{ height: `${(val / maxWeekly) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
