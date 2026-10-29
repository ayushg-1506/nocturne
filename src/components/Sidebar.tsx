import React from 'react';
import { 
  Radar, 
  Activity, 
  FileText, 
  Radio, 
  UploadCloud, 
  SlidersHorizontal,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export type ActiveSection = 'overview' | 'telemetry' | 'incidents' | 'spectral' | 'ingest' | 'settings';

interface SidebarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  activeAnomalyCount: number;
  caseNumber: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  activeAnomalyCount,
  caseNumber
}) => {
  const navItems: { id: ActiveSection; index: string; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      index: '01',
      label: 'SPATIAL RADAR',
      icon: <Radar size={15} />
    },
    {
      id: 'telemetry',
      index: '02',
      label: 'TELEMETRY STREAMS',
      icon: <Activity size={15} />
    },
    {
      id: 'incidents',
      index: '03',
      label: 'INCIDENT DOSSIERS',
      icon: <FileText size={15} />,
      badge: activeAnomalyCount > 0 ? `${activeAnomalyCount}` : undefined
    },
    {
      id: 'spectral',
      index: '04',
      label: 'SPECTRAL LAB',
      icon: <Radio size={15} />
    },
    {
      id: 'ingest',
      index: '05',
      label: 'DATA INGEST & SIM',
      icon: <UploadCloud size={15} />
    },
    {
      id: 'settings',
      index: '06',
      label: 'SYSTEM CONFIG',
      icon: <SlidersHorizontal size={15} />
    }
  ];

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      height: '100vh',
      background: '#040704',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 12px',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Top: Identity Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 8px 14px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid var(--accent-green)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Terminal size={17} color="var(--accent-green-bright)" />
          </div>

          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--accent-green-bright)',
              fontFamily: 'var(--font-mono)'
            }}>
              NOCTURNE
            </div>
            <div style={{
              fontSize: '9px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em'
            }}>
              FORENSICS v2.4.0
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '8px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
          NAVIGATION
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '2px',
                  background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent-green)' : 'transparent'}`,
                  color: isActive ? 'var(--accent-green-bright)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ color: isActive ? 'var(--accent-green-bright)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <span>[{item.index}] {item.label}</span>
                </div>

                {item.badge && (
                  <span className="badge-crimson" style={{ fontSize: '9px', padding: '1px 5px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: System Status & Active Case Info */}
      <div style={{
        padding: '10px',
        background: '#020502',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }} className="pulse-green">
            * SYSTEM ONLINE
          </span>
          <span className="badge-green" style={{ fontSize: '8px', padding: '1px 4px' }}>
            AIR-GAPPED
          </span>
        </div>

        <div style={{ color: 'var(--text-muted)' }}>
          CASE: <strong style={{ color: 'var(--text-primary)' }}>{caseNumber}</strong>
        </div>

        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={11} color="var(--accent-green)" />
          <span>ZERO CLOUD TELEMETRY</span>
        </div>
      </div>
    </aside>
  );
};
