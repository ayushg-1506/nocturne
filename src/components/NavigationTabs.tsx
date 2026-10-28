import React from 'react';
import { 
  Radar, 
  Activity, 
  Radio, 
  FileText, 
  FlaskConical
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
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Spatial Radar & Map',
      icon: <Radar size={15} />
    },
    {
      id: 'telemetry',
      label: 'Multi-Spectral Telemetry',
      icon: <Activity size={15} />
    },
    {
      id: 'oscilloscope',
      label: 'Oscilloscope & 18.98Hz EVP',
      icon: <Radio size={15} />
    },
    {
      id: 'dossier',
      label: 'AI Forensic Dossier (Gemma 2)',
      icon: <FileText size={15} />,
      badge: `${anomalyCount} Anomaly Vectors`
    },
    {
      id: 'simulation',
      label: 'Simulator & CSV Ingest',
      icon: <FlaskConical size={15} />
    }
  ];

  return (
    <nav style={{
      margin: '0 16px 12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '2px'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%)' 
                : 'rgba(15, 23, 42, 0.6)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: isActive ? 700 : 500,
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit', display: 'flex' }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="badge badge-crimson" style={{ fontSize: '9px', padding: '2px 6px' }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
