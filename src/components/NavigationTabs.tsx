import React from 'react';
import { 
  Radar, 
  Activity, 
  Radio, 
  FileText, 
  Cpu
} from 'lucide-react';

export type ActiveTab = 'overview' | 'telemetry' | 'oscilloscope' | 'dossier' | 'simulation';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  anomalyCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  anomalyCount
}) => {
  const tabs: { id: ActiveTab; index: string; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'overview',
      index: '01',
      label: 'SPATIAL RADAR & MAP',
      icon: <Radar size={13} />
    },
    {
      id: 'telemetry',
      index: '02',
      label: 'MULTI-SPECTRAL TELEMETRY',
      icon: <Activity size={13} />
    },
    {
      id: 'oscilloscope',
      index: '03',
      label: 'OSCILLOSCOPE & 18.98Hz',
      icon: <Radio size={13} />
    },
    {
      id: 'dossier',
      index: '04',
      label: 'AI FORENSIC DOSSIER',
      icon: <FileText size={13} />,
      count: anomalyCount
    },
    {
      id: 'simulation',
      index: '05',
      label: 'SIMULATOR & CSV INGEST',
      icon: <Cpu size={13} />
    }
  ];

  return (
    <nav style={{
      margin: '0 16px 10px 16px',
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '2px',
      padding: '3px',
      gap: '3px',
      overflowX: 'auto'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '2px',
              background: isActive 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'transparent',
              color: isActive ? 'var(--accent-green-bright)' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--accent-green)' : 'transparent'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span style={{ color: isActive ? 'var(--accent-green-bright)' : 'var(--text-muted)' }}>
              {tab.icon}
            </span>
            <span>[{tab.index}] {tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="badge-crimson" style={{ fontSize: '9px', padding: '1px 5px', marginLeft: '4px' }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
