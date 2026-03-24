import React from 'react';

interface DashboardProps {
  data: {
    vision: {
      crack_detected: boolean;
      crack_area_percent: number;
      crack_count: number;
      confidence: number;
      predictions: any[];
      risk_score: number;
      risk_level: string;
    };
    time: {
      remaining_life_years: number;
      degradation_curve: number[];
    };
    internal: {
      carbonation_risk: string;
      vibration_risk: string;
      internal_risk_level: string;
    };
    risk: {
      risk_level: string;
      risk_score: number;
    };
    suggestions: string[];
  };
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { vision, time, internal, risk, suggestions } = data;

  const getStatusColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'var(--danger)';
      case 'HIGH': return 'var(--primary)';
      case 'MEDIUM': return 'var(--warning)';
      default: return 'var(--success)';
    }
  };

  const renderForecastChart = () => {
    const curve = time.degradation_curve || [];
    if (curve.length === 0) return null;
    
    const w = 400;
    const h = 100;
    const padding = 10;
    
    const points = curve.map((v, i) => {
      const x = padding + (i / (curve.length - 1)) * (w - padding * 2);
      const y = h - padding - (v / 100) * (h - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="80" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={points} />
        {curve.map((v, i) => {
          const x = padding + (i / (curve.length - 1)) * (w - padding * 2);
          const y = h - padding - (v / 100) * (h - padding * 2);
          return <rect key={i} x={x-2} y={y-2} width="4" height="4" fill="var(--text-main)" />
        })}
      </svg>
    );
  };

  return (
    <div className="dashboard-grid">
      
      {/* 0. CONTEXT HEADER / MASTER STATUS */}
      <div className="glass-panel" style={{ gridColumn: '1 / -1', background: 'var(--surface-highest)', border: '2px solid var(--border-color)' }}>
        <div className="status-strip" style={{ background: getStatusColor(risk.risk_level) }}></div>
        <div style={{ paddingLeft: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge">SYSTEM READY // STRUCTURAL DIAGNOSIS</div>
            <h2 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'Space Grotesk' }}>{risk.risk_level}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>AGGREGATE STRUCTURAL INTEGRITY INDEX</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-value" style={{ color: getStatusColor(risk.risk_level), fontSize: '4.5rem' }}>{risk.risk_score}<span style={{ fontSize: '1.5rem' }}>%</span></div>
          </div>
        </div>
      </div>

      {/* 1. VISION ENGINE (SURFACE) */}
      <div className="glass-panel">
        <div className="status-strip" style={{ background: getStatusColor(vision.risk_level) }}></div>
        <span className="badge vision">01 // SURFACE_VISION_SCAN</span>
        
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-color)', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'white', padding: '1rem' }}>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>{vision.crack_count}</div>
              <div className="metric-unit">TOTAL_CRACKS</div>
            </div>
            <div style={{ background: 'white', padding: '1rem' }}>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>{vision.crack_area_percent}%</div>
              <div className="metric-unit">AREA_ESTIMATE</div>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-highest)', padding: '0.5rem 0' }}>
               <span>CONFIDENCE_SCORE</span>
               <span style={{ color: 'var(--primary)' }}>{vision.confidence.toFixed(3)}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
               <span>LOCAL_CONDITION</span>
               <span>{vision.risk_level}</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. INTERNAL ENGINE (SUB-SURFACE) */}
      <div className="glass-panel">
        <div className="status-strip" style={{ background: getStatusColor(internal.internal_risk_level) }}></div>
        <span className="badge">02 // SUB_SURFACE_HEALTH</span>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ background: 'var(--surface-low)', padding: '1rem', border: '1px solid var(--border-color)' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>CARBONATION_PENETRATION</div>
             <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: getStatusColor(internal.carbonation_risk) }}>{internal.carbonation_risk}</div>
          </div>
          
          <div style={{ background: 'var(--surface-low)', padding: '1rem', border: '1px solid var(--border-color)' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DYNAMIC_VIBRATION_ANOMALY</div>
             <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: getStatusColor(internal.vibration_risk) }}>{internal.vibration_risk}</div>
          </div>

          <div style={{ background: 'var(--text-main)', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
             INTERNAL_RISK_RATING: {internal.internal_risk_level}
          </div>
        </div>
      </div>

      {/* 3. TIME ENGINE (FORECAST) */}
      <div className="glass-panel">
        <div className="status-strip" style={{ background: 'var(--tertiary)' }}></div>
        <span className="badge time">03 // PROBABI_LIFE_FORECAST</span>
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
             <div>
               <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--primary)' }}>{time.remaining_life_years}</div>
               <div className="metric-unit">EST_LIFE_UNITS(Y)</div>
             </div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{new Date().getFullYear() + time.remaining_life_years}</div>
               <div className="metric-unit">LIMIT_THRESH_EXPECT</div>
             </div>
          </div>

          <div style={{ background: 'var(--surface-highest)', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
             {renderForecastChart()}
             <div style={{ fontSize: '0.6rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem' }}>LSTM_DEGRADATION_PROJECTION</div>
          </div>
        </div>
      </div>

      {/* 4. REINFORCEMENT SUGGESTIONS */}
      <div className="glass-panel" style={{ gridColumn: '1 / -1', border: '2px solid var(--primary)', background: 'var(--surface-highest)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '1rem' }}>[ PROTOCOL_RECOMMENDATIONS ]</h3>
        <div className="suggestion-box">
          {suggestions.map((s, i) => (
            <div key={i} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              border: '1px solid var(--primary)', 
              fontWeight: 700,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', flexShrink: 0 }}></div>
              {s}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
