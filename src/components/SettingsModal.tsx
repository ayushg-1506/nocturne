import React, { useState } from 'react';
import type { ModelProviderConfig } from '../engine/gemmaForensics';
import { Settings, Check, X, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelProviderConfig;
  onSaveConfig: (newConfig: ModelProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [provider, setProvider] = useState<ModelProviderConfig['provider']>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || 'http://localhost:11434/v1');
  const [modelName, setModelName] = useState(config.modelName || 'gemma2:9b');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      modelName: modelName.trim()
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid var(--border-highlight)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={18} color="var(--accent-violet)" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                FORENSIC ENGINE &amp; MODEL SETTINGS
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Configure Google Gemma 2 &amp; TabPFN Anomaly Runtime
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Air-Gapped Philosophy Callout */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            gap: '10px'
          }}>
            <Shield size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Why Open Innovation Matters:</strong> Nocturne was designed to run 100% air-gapped on your laptop. Domestic sensor logs contain intimate activity patterns; open-weight models ensure your home data never leaves your machine.
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SELECT INFERENCE PROVIDER:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {/* Built-in Gemma Matrix */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: provider === 'built-in' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${provider === 'built-in' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="built-in"
                  checked={provider === 'built-in'}
                  onChange={() => setProvider('built-in')}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Built-in Offline Forensic Adapter (Default)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    100% Local, zero-latency, deterministic Gemma 2 protocol. No API key needed.
                  </span>
                </div>
              </label>

              {/* Google AI Studio Gemini API */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: provider === 'gemini' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${provider === 'gemini' ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Google AI Studio (Free Gemini / Gemma Endpoint)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Connects directly to Google's free-tier developer API.
                  </span>
                </div>
              </label>

              {/* Local Ollama */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: provider === 'ollama' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${provider === 'ollama' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="ollama"
                  checked={provider === 'ollama'}
                  onChange={() => setProvider('ollama')}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Local Ollama Instance (`ollama run gemma2`)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Points to local port 11434 for pure offline GPU/CPU model inference.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional API Key Input */}
          {provider === 'gemini' && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                GOOGLE AI STUDIO API KEY:
              </label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                You can generate a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>aistudio.google.com</a>.
              </p>
            </div>
          )}

          {/* Local Ollama settings */}
          {provider === 'ollama' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  OLLAMA BASE URL:
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  MODEL TAG:
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder="gemma2:9b"
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px' }}>
              <Check size={14} />
              <span>APPLY SETTINGS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
