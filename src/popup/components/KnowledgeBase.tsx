import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Loader2, Database } from 'lucide-react';

interface KnowledgeBaseProps {
  chunksCount: number;
  sources: string[];
  onRefresh: () => void;
  onAddKnowledge: (text: string, source: string) => Promise<void>;
}

export default function KnowledgeBase({ chunksCount, sources, onRefresh, onAddKnowledge }: KnowledgeBaseProps) {
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleAddText = async () => {
    if (!pasteText.trim()) return;
    setIsLoading(true);
    setError('');
    const srcName = `Pasted Text - ${new Date().toLocaleTimeString()}`;
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
      {/* Status Badge */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div className="flex items-center space-x-2">
          <Database size={18} className="text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <span className="text-sm font-semibold tracking-wide text-gray-200">Vector Store</span>
        </div>
        <span className="bg-brand-900/50 border border-brand-500/30 text-xs px-3 py-1 rounded-full text-brand-100 font-mono shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          {chunksCount} chunks
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-neon-purple transition-colors duration-300 bg-white/5 backdrop-blur-sm group overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <UploadCloud className="text-gray-400 group-hover:text-neon-purple mb-3 transition-colors duration-300 drop-shadow-md z-10" size={28} />
        <span className="text-sm font-medium text-gray-200 z-10">Drop .txt or .md</span>
        <span className="text-xs text-gray-400 mt-1 z-10">or click to browse</span>
        <input 
          type="file" 
          accept=".txt,.md" 
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
        />
      </div>

      {/* Paste Area */}
      <div className="flex flex-col space-y-3">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste plain text here..."
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-sm text-gray-200 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue resize-none h-24 outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] placeholder:text-gray-500"
        />
        <button
          onClick={handleAddText}
          disabled={isLoading || !pasteText.trim()}
          className="bg-gradient-to-r from-brand-600 to-neon-purple hover:from-brand-500 hover:to-neon-purple/80 disabled:opacity-50 disabled:grayscale text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_15px_rgba(176,38,255,0.4)] hover:shadow-[0_4px_25px_rgba(176,38,255,0.6)] hover:scale-[1.02] active:scale-95"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Add Text Context'}
        </button>
        {error && (
          <div className="text-xs text-neon-pink bg-neon-pink/10 border border-neon-pink/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
      
      {/* List of sources */}
      {sources.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col space-y-2 max-h-32 overflow-y-auto custom-scrollbar shadow-inner">
          {sources.map(src => (
            <div key={src} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-white/10 transition-colors group">
              <span className="text-gray-300 truncate w-3/4 flex items-center">
                <FileText size={14} className="mr-2 text-brand-400" />
                {src}
              </span>
              <button onClick={() => handleDelete(src)} className="text-gray-500 hover:text-neon-pink transition-colors group-hover:scale-110">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
