import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Loader2, Database } from 'lucide-react';

interface KnowledgeBaseProps {
  onAddKnowledge: (text: string, source: string) => void;
}

export default function KnowledgeBase({ onAddKnowledge }: KnowledgeBaseProps) {
  const [chunksCount, setChunksCount] = useState(0);
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);

  const fetchStats = () => {
    chrome.runtime?.sendMessage({ type: 'GET_STATS' }, (res: { [key: string]: any }) => {
      if (res?.knowledgeChunks) setChunksCount(res.knowledgeChunks);
      // Assuming GET_STATS could return unique sources if we updated it, or we just rely on counting for now.
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      onAddKnowledge(text, file.name);
      setIsLoading(false);
      // In a real app we'd wait for a success response to update chunk count
    };
    reader.readAsText(file);
  };

  const handleAddText = () => {
    if (!pasteText.trim()) return;
    setIsLoading(true);
    const srcName = `Pasted Text - ${new Date().toLocaleTimeString()}`;
    onAddKnowledge(pasteText, srcName);
    setSources(prev => [...prev, srcName]);
    setPasteText('');
    setIsLoading(false);
  };

  const handleDelete = (source: string) => {
    chrome.runtime?.sendMessage({ type: 'DELETE_KNOWLEDGE', payload: { source } }, () => {
      setSources(sources.filter(s => s !== source));
      fetchStats();
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-2">
          <Database size={16} className="text-brand-500" />
          <span className="text-sm font-medium">Vector Store</span>
        </div>
        <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-brand-50 font-mono">
          {chunksCount} chunks
        </span>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-brand-500 transition-colors bg-gray-800/50">
        <UploadCloud className="text-gray-400 mb-2" size={24} />
        <span className="text-sm font-medium text-gray-300">Drop .txt or .md</span>
        <span className="text-xs text-gray-500 mt-1">or click to browse</span>
        <input 
          type="file" 
          accept=".txt,.md" 
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
      </div>

      {/* Paste Area */}
      <div className="flex flex-col space-y-2">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste plain text here..."
          className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 resize-none h-20"
        />
        <button
          onClick={handleAddText}
          disabled={isLoading || !pasteText.trim()}
          className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Add Text Context'}
        </button>
      </div>
      {/* List of sources */}
      {sources.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex flex-col space-y-2 max-h-32 overflow-y-auto">
          {sources.map(src => (
            <div key={src} className="flex justify-between items-center text-sm">
              <span className="text-gray-300 truncate w-3/4 flex items-center">
                <FileText size={14} className="mr-2 text-gray-500" />
                {src}
              </span>
              <button onClick={() => handleDelete(src)} className="text-red-400 hover:text-red-300 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
