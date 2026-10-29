import React, { useState } from 'react';
import type { ModelProviderConfig } from '../engine/gemmaForensics';
import { X, Check, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelProviderConfig;
  onSaveConfig: (cfg: ModelProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [provider, setProvider] = useState<ModelProviderConfig['provider']>(config.provider);
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl || 'http://localhost:11434/v1');
  const [modelName, setModelName] = useState<string>(config.modelName || 'gemma2:9b');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey: apiKey.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined,
      modelName: modelName.trim() || undefined
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--accent-green)',
        borderRadius: '2px',
        width: '100%',
        maxWidth: '560px',
        padding: '20px',
        boxShadow: 'var(--shadow-glow-green)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-green-bright)" />
            <span className="terminal-title">
              AI ENGINE &amp; MODEL RUNTIME CONFIGURATION
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              SELECT INFERENCE PROVIDER:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Built-in */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                background: provider === 'built-in' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
                border: `1px solid ${provider === 'built-in' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="built-in"
                  checked={provider === 'built-in'}
                  onChange={() => setProvider('built-in')}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    [01] Built-in Offline Adapter (Default)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    100% Local, zero-latency, deterministic Bayesian reasoning. No API key needed.
                  </div>
                </div>
              </label>

              {/* Google AI Studio */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                background: provider === 'gemini' ? 'rgba(245, 158, 11, 0.12)' : '#040804',
                border: `1px solid ${provider === 'gemini' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    [02] Google AI Studio (Gemini / Gemma API)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Connects directly to Google's cloud developer API endpoint.
                  </div>
                </div>
              </label>

              {/* Local Ollama */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                background: provider === 'ollama' ? 'rgba(34, 197, 94, 0.12)' : '#040804',
                border: `1px solid ${provider === 'ollama' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="ollama"
                  checked={provider === 'ollama'}
                  onChange={() => setProvider('ollama')}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    [03] Local Ollama Instance (`gemma2:9b`)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Points to local port 11434 for pure offline model inference.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional API Key Input */}
          {provider === 'gemini' && (
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                GOOGLE AI STUDIO API KEY:
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{ width: '100%', fontSize: '11px' }}
              />
            </div>
          )}

          {/* Local Ollama settings */}
          {provider === 'ollama' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  OLLAMA BASE URL:
                </div>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  style={{ width: '100%', fontSize: '11px' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  MODEL TAG:
                </div>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder="gemma2:9b"
                  style={{ width: '100%', fontSize: '11px' }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '11px' }}>
              [ CANCEL ]
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ padding: '5px 16px', fontSize: '11px' }}>
              <Check size={13} />
              <span>[ APPLY SETTINGS ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
