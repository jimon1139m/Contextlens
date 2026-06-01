import type { ExtensionSettings } from '../../shared/types';
import { ToggleLeft, ToggleRight, Settings2 } from 'lucide-react';

interface SettingsProps {
  settings: ExtensionSettings;
  onChange: (settings: ExtensionSettings) => void;
}

interface ToggleRowProps {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, desc, checked, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer" onClick={onToggle}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-xs text-gray-400">{desc}</span>
      </div>
      <button 
        className={`p-1 rounded-full transition-all duration-300 ${checked ? 'text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-110' : 'text-gray-600 scale-95'}`}
      >
        {checked ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
      </button>
    </div>
  );
}

export default function Settings({ settings, onChange }: SettingsProps) {
  const updateSetting = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl"></div>
        <div className="flex items-center space-x-2 mb-4 text-brand-100 relative z-10">
          <Settings2 size={18} className="text-brand-400" />
          <h2 className="font-bold text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-neon-purple">Core Engine</h2>
        </div>
        
        <div className="space-y-1 relative z-10">
          <ToggleRow 
            label="Enable ContextLens" 
            desc="Master switch for interception"
            checked={settings.enabled}
            onToggle={() => updateSetting('enabled', !settings.enabled)}
          />
          <ToggleRow 
            label="RAG Context Injection" 
            desc="Prepend matching KB chunks"
            checked={settings.ragEnabled}
            onToggle={() => updateSetting('ragEnabled', !settings.ragEnabled)}
          />
          <ToggleRow 
            label="Prompt Compression" 
            desc="Strip fluff and verbose phrases"
            checked={settings.compressionEnabled}
            onToggle={() => updateSetting('compressionEnabled', !settings.compressionEnabled)}
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col space-y-5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-200">Max Context Chunks</label>
            <span className="text-xs bg-black/40 border border-brand-500/50 text-neon-blue px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.3)] font-mono">{settings.maxChunks}</span>
          </div>
          <input 
            type="range" 
            min="1" max="10" 
            value={settings.maxChunks}
            onChange={(e) => updateSetting('maxChunks', parseInt(e.target.value))}
            className="w-full accent-neon-blue cursor-pointer"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">How many retrieved notes to inject.</span>
        </div>

        <div className="relative z-10">
          <label className="text-sm font-medium text-gray-200 mb-2 block">Compression Level</label>
          <div className="relative">
            <select 
              value={settings.compressionLevel}
              onChange={(e) => updateSetting('compressionLevel', e.target.value as ExtensionSettings['compressionLevel'])}
              className="w-full bg-black/40 backdrop-blur-md border border-white/10 text-sm rounded-lg p-2.5 text-gray-200 focus:ring-1 focus:ring-neon-purple focus:border-neon-purple outline-none appearance-none cursor-pointer transition-all shadow-inner"
            >
              <option value="light" className="bg-gray-900">Light (Openers only)</option>
              <option value="medium" className="bg-gray-900">Medium (Fillers removed)</option>
              <option value="aggressive" className="bg-gray-900">Aggressive (Maximum condensation)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
