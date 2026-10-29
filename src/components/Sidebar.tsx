import React from 'react';
import { 
  Radar, 
  Activity, 
  FileText, 
  Radio, 
  UploadCloud, 
  SlidersHorizontal,
  Terminal,
  ShieldCheck
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
      width: '230px',
      minWidth: '230px',
      height: '100vh',
      background: '#040507',
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
          padding: '4px 6px 14px 6px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#09150b',
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
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>NOCTURNE</span>
              <span style={{ color: 'var(--accent-green-bright)', fontSize: '11px' }}>_</span>
            </div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em'
            }}>
              FORENSICS v2.4.0
            </div>
          </div>
        </div>

        {/* Section Navigation Header */}
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          paddingLeft: '8px',
          marginBottom: '8px',
          fontFamily: 'var(--font-mono)'
        }}>
          SECTION ROUTING
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  background: isActive ? '#0d1810' : 'transparent',
                  border: isActive ? '1px solid var(--accent-green)' : '1px solid transparent',
                  borderLeft: isActive ? '3px solid var(--accent-green-bright)' : '3px solid transparent',
                  color: isActive ? '#ffffff' : '#d4d4d8',
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
                  <span style={{ color: isActive ? 'var(--accent-green-bright)' : '#9ca3af' }}>
                    {item.icon}
                  </span>
                  <span>
                    <span style={{ color: isActive ? 'var(--accent-green-bright)' : '#9ca3af', marginRight: '6px', fontWeight: 600 }}>
                      [{item.index}]
                    </span>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span className="badge-crimson" style={{ fontSize: '9px', padding: '1px 6px' }}>
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
        padding: '12px 10px',
        background: '#07080b',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green-bright)' }} className="pulse-green" />
            ONLINE
          </span>
          <span className="badge-green" style={{ fontSize: '8px', padding: '1px 5px' }}>
            AIR-GAPPED
          </span>
        </div>

        <div style={{ color: '#d4d4d8', marginTop: '2px' }}>
          CASE: <strong style={{ color: '#ffffff' }}>{caseNumber}</strong>
        </div>

        <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', marginTop: '2px' }}>
          <ShieldCheck size={12} color="var(--accent-green)" />
          <span>ZERO CLOUD TELEMETRY</span>
        </div>
      </div>
    </aside>
  );
};
