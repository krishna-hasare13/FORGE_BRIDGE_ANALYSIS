import React from 'react';

interface DashboardProps {
  data: {
    vision: any;
    risk: any;
    time: any;
    suggestions: string[];
  };
  imagePreview: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ data, imagePreview }) => {
  const { vision, risk, time, suggestions } = data;

  // Render SVG Life Curve
  const renderLifeCurve = () => {
    if (!time.degradation_curve || time.degradation_curve.length === 0) return null;
    
    const maxYear = time.degradation_curve[time.degradation_curve.length - 1].year;
    const minYear = time.degradation_curve[0].year;
    const padding = 20;
    const width = 300 - padding * 2;
    const height = 150 - padding * 2;

    const points = time.degradation_curve.map((point: any, index: number) => {
      const x = padding + (index / (time.degradation_curve.length - 1)) * width;
      const y = padding + height - (point.health_index / 100) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="150" viewBox="0 0 300 150">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--warning)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Draw axes */}
        <line x1={padding} y1={padding + height} x2={padding + width} y2={padding + height} stroke="var(--border-color)" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={padding + height} stroke="var(--border-color)" strokeWidth="2" />
        
        {/* Draw curve area */}
        <polygon points={`${padding},${padding + height} ${points} ${padding + width},${padding + height}`} fill="url(#gradient)" />
        
        {/* Draw curve line */}
        <polyline fill="none" stroke="var(--accent-time)" strokeWidth="3" points={points} />
        
        {/* Draw points */}
        {time.degradation_curve.map((point: any, index: number) => {
          const x = padding + (index / (time.degradation_curve.length - 1)) * width;
          const y = padding + height - (point.health_index / 100) * height;
          return <circle key={index} cx={x} cy={y} fill="#fff" r="3" />
        })}
        <text x={padding} y={padding + height + 15} fill="var(--text-muted)" fontSize="10">{minYear}</text>
        <text x={padding + width - 15} y={padding + height + 15} fill="var(--text-muted)" fontSize="10">{maxYear}</text>
      </svg>
    );
  };

  return (
    <div className="dashboard-grid">
      {/* Risk AI Panel */}
      <div className="glass-panel" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--accent-risk)' }}>
        <span className="badge risk">Model 2 — XGBoost (Risk AI)</span>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Structural Risk Assessment</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <div className="stat-value">{risk.risk_score} / 100</div>
            <div style={{ color: 'var(--text-muted)' }}>Calculated Risk Score</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: `var(--${risk.risk_level.toLowerCase() === 'critical' ? 'danger' : risk.risk_level.toLowerCase() === 'high' ? 'danger' : 'warning'})` }}>
              {risk.risk_level}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>Risk Category</div>
          </div>
        </div>

        <div className="risk-meter">
          <div className="risk-fill" data-level={risk.risk_level} style={{ width: `${risk.risk_score}%` }}></div>
        </div>
      </div>

      {/* Vision AI Panel */}
      <div className="glass-panel">
        <span className="badge vision">Model 1 — YOLOv8 (Vision AI)</span>
        <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>Crack Detection</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{vision.crack_area_percent}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Crack Area</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{vision.crack_count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identified Cracks</div>
          </div>
        </div>

        {vision && vision.image_with_bboxes ? (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '150px' }}>
            <img src={vision.image_with_bboxes} alt="Analyzed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          imagePreview && (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '150px' }}>
            <img src={imagePreview} alt="Preview fallback" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.2)' }} />
          </div>
          )
        )}
      </div>

      {/* Time AI Panel */}
      <div className="glass-panel">
        <span className="badge time">Model 3 — LSTM (Time AI)</span>
        <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>Life Prediction Forecast</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-time)' }}>{time.remaining_life_years}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Years Remaining</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{time.collapse_risk_year}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Collapse Year</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Degradation Curve</div>
          {renderLifeCurve()}
        </div>
      </div>

      {/* Reinforcement Engine Panel */}
      <div className="glass-panel" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Reinforcement Engine - Recommended Actions
        </h3>
        
        <ul className="suggestion-list">
          {suggestions.map((suggestion, idx) => (
            <li key={idx}><strong>{suggestion}</strong></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
