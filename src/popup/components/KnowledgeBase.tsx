import { useState, useEffect, useCallback, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';

interface KnowledgeBaseProps {
  chunksCount: number;
  sources: string[];
  sourceChunkCounts: Record<string, number>;
  onRefresh: () => void;
  onAddKnowledge: (text: string, source: string) => Promise<void>;
}

export default function KnowledgeBase({
  chunksCount,
  sources,
  sourceChunkCounts,
  onRefresh,
  onAddKnowledge,
}: KnowledgeBaseProps) {
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  // ── Drag & Drop ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      await processFile(file);
    }
  }, []);

  // ── File Processing ──
  const processFile = async (file: File) => {
    setIsLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        await onAddKnowledge(text, file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add knowledge');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleAddText = async () => {
    if (!pasteText.trim()) return;
    setIsLoading(true);
    setError('');
    const srcName = `Pasted Text — ${new Date().toLocaleTimeString()}`;
    try {
      await onAddKnowledge(pasteText, srcName);
      setPasteText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (source: string) => {
    chrome.runtime?.sendMessage({ type: 'DELETE_KNOWLEDGE', payload: { source } }, () => {
      onRefresh();
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* ── Title + Badge ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide">Knowledge Base</h2>
        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          {chunksCount} chunks stored
        </span>
      </div>

      {/* ── Paste Text Area ── */}
      <div className="relative">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your knowledge here..."
          className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue/50 resize-none h-28 outline-none transition-all placeholder:text-gray-500"
        />
        {pasteText.trim() && (
          <button
            onClick={handleAddText}
            disabled={isLoading}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-brand-600 to-neon-purple text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
          </button>
        )}
      </div>

      {/* ── Drop Zone ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
            : 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10'
        }`}
      >
        <UploadCloud
          size={24}
          className={`mb-1.5 transition-colors ${isDragOver ? 'text-neon-blue' : 'text-gray-400'}`}
        />
        <span className="text-xs font-medium text-gray-300">Drop .txt or .md files here</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-xs text-neon-pink bg-neon-pink/10 border border-neon-pink/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* ── Stored Knowledge ── */}
      {sources.length > 0 && (
        <div>
          <span className="text-sm font-semibold text-white block mb-2.5">Stored Knowledge</span>
          <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {sources.map((src, idx) => {
              const chunks = sourceChunkCounts[src] || 0;
              return (
                <div
                  key={src}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                >
                  {/* Number */}
                  <span className="text-[10px] text-gray-500 font-bold w-4 shrink-0">{idx + 1}.</span>

                  {/* Document icon */}
                  <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-brand-400" />
                  </div>

                  {/* Title + chunks */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{src}</div>
                    <div className="text-[10px] text-gray-400">{chunks} chunks</div>
                  </div>

                  {/* Chunk count badge + delete */}
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">{chunks} chunks</span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(src); }}
                    className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors shrink-0 opacity-70 group-hover:opacity-100"
                  >
                    <X size={12} className="text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
          <Loader2 size={14} className="animate-spin text-neon-blue" />
          Processing knowledge...
        </div>
      )}
    </div>
  );
}
