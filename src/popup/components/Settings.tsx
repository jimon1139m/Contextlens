import type { ExtensionSettings } from '../../shared/types';
import { ToggleLeft, ToggleRight, Settings2 } from 'lucide-react';

interface SettingsProps {
  settings: ExtensionSettings;
  onChange: (settings: ExtensionSettings) => void;
}

export default function Settings({ settings, onChange }: SettingsProps) {
  const updateSetting = (key: keyof ExtensionSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const Toggle = ({ label, desc, checked, onChangeKey }: { label: string, desc: string, checked: boolean, onChangeKey: keyof ExtensionSettings }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-xs text-gray-500">{desc}</span>
      </div>
      <button 
        onClick={() => updateSetting(onChangeKey, !checked)}
        className={`p-1 rounded-full transition-colors ${checked ? 'text-brand-500' : 'text-gray-600'}`}
      >
        {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4 text-brand-50">
          <Settings2 size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wide">Core Engine</h2>
        </div>
        
        <div className="space-y-1">
          <Toggle 
            label="Enable ContextLens" 
            desc="Master switch for interception"
            checked={settings.enabled}
            onChangeKey="enabled"
          />
          <Toggle 
            label="RAG Context Injection" 
            desc="Prepend matching KB chunks"
            checked={settings.ragEnabled}
            onChangeKey="ragEnabled"
          />
          <Toggle 
            label="Prompt Compression" 
            desc="Strip fluff and verbose phrases"
            checked={settings.compressionEnabled}
            onChangeKey="compressionEnabled"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-200">Max Context Chunks</label>
            <span className="text-xs text-brand-400 font-mono">{settings.maxChunks}</span>
          </div>
          <input 
            type="range" 
            min="1" max="10" 
            value={settings.maxChunks}
            onChange={(e) => updateSetting('maxChunks', parseInt(e.target.value))}
            className="w-full accent-brand-500"
          />
          <span className="text-xs text-gray-500 mt-1 block">How many retrieved notes to inject.</span>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-200 mb-2 block">Compression Level</label>
          <select 
            value={settings.compressionLevel}
            onChange={(e) => updateSetting('compressionLevel', e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 text-sm rounded p-2 text-gray-200 focus:ring-1 focus:ring-brand-500 outline-none"
          >
            <option value="light">Light (Openers only)</option>
            <option value="medium">Medium (Fillers removed)</option>
            <option value="aggressive">Aggressive (Maximum condensation)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
