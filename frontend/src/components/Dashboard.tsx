import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  Zap, 
  FileCheck, 
  TrendingDown, 
  Layers, 
  Lightbulb,
  Microscope,
  Info,
  AlertTriangle
} from 'lucide-react';
import BracketViewer from './BracketViewer';

interface DashboardProps {
  data: {
    vision: {
      crack_detected: boolean;
      crack_area_percent: number;
      crack_count: number;
      confidence: number;
      predictions: {
          class: string;
          confidence: number;
          box: [number, number, number, number];
      }[];
      risk_score: number;
      risk_level: string;
      stl_path?: string;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 100 }
  }
} as const;

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { vision, time, internal, risk, suggestions } = data;

  const getStatusColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'var(--danger)';
      case 'HIGH': return 'var(--warning)';
      case 'MEDIUM': return '#00d4ff';
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
      <div className="chart-container" style={{ position: 'relative', height: '120px' }}>
        <svg width="100%" height="120" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--secondary)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'var(--secondary)', stopOpacity: 0 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <motion.path 
            fill="url(#grad)"
            d={`M ${padding},${h-padding} ${points} L ${w-padding},${h-padding} Z`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />
          <motion.polyline 
            fill="none" 
            stroke="var(--secondary)" 
            strokeWidth="3" 
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ filter: 'url(#glow)' }}
          />
          {curve.map((v, i) => {
            const x = padding + (i / (curve.length - 1)) * (w - padding * 2);
            const y = h - padding - (v / 100) * (h - padding * 2);
            return (
              <motion.circle 
                key={i} cx={x} cy={y} r="4" 
                fill="var(--text-main)" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                style={{ filter: 'drop-shadow(0 0 8px var(--secondary))' }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <motion.div 
      className="dashboard-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ position: 'relative' }}
    >
      {risk.risk_score > 90 && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel"
          style={{ 
            gridColumn: 'span 12', 
            background: 'rgba(255, 0, 0, 0.15)', 
            borderColor: '#ff0000', 
            boxShadow: '0 0 40px rgba(255, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            marginBottom: '1rem',
            animation: 'pulse-red 2s infinite'
          }}
        >
          <AlertTriangle color="#ff0000" size={24} />
          <span style={{ color: '#ff0000', fontWeight: 900, letterSpacing: '4px', fontSize: '1rem' }}>CRITICAL_SYSTEM_FAILURE_IMMINENT // RISK_THRESHOLD_EXCEEDED</span>
          <AlertTriangle color="#ff0000" size={24} />
        </motion.div>
      )}
      
      {/* 0. CONTEXT HEADER / MASTER INTEGRITY */}
      <motion.div 
        variants={itemVariants}
        className="glass-panel" 
        style={{ gridColumn: 'span 12', padding: '2.5rem' }}
      >
        <div className="status-strip" style={{ background: getStatusColor(risk.risk_level), height: '4px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge">
              <ShieldCheck size={12} />
              SYSTEM DIAGNOSTIC: READY
            </div>
            <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: getStatusColor(risk.risk_level) }}>
              STRUCTURAL_{risk.risk_level}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>
              AGGREGATED STRUCTURAL INTEGRITY INDEX // BHARAT FORGE QUANTUM
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="stat-value" 
              style={{ 
                fontSize: '6rem', 
                color: risk.risk_score > 90 ? '#ff0000' : getStatusColor(risk.risk_level),
                textShadow: risk.risk_score > 90 ? '0 0 30px rgba(255,0,0,0.5)' : 'none'
              }}
            >
              {risk.risk_score === 100 && <AlertTriangle size={40} style={{ verticalAlign: 'middle', marginRight: '1rem' }} />}
              {risk.risk_score}<span style={{ fontSize: '2rem', opacity: 0.5 }}>%</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 1. VISION ENGINE (SURFACE) */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: 'span 4' }}>
        <div className="status-strip" style={{ background: getStatusColor(vision.risk_level) }}></div>
        <div className="badge">
          <Activity size={12} />
          SURFACE_AI_SCANNER
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Visual Metrics */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>ANOMALIES_DETECTED</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{vision.crack_count}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>VOLUMETRIC_LOSS</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{vision.crack_area_percent}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>%</span></div>
          </div>
          
          {/* Detailed Diagnostics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem', background: 'rgba(0,212,255,0.03)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI_CONFIDENCE_RATING</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 800, fontFamily: 'monospace' }}>{vision.confidence.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SURFACE_STATUS</span>
                <span style={{ color: getStatusColor(vision.risk_level), fontWeight: 800 }}>{vision.risk_level}</span>
              </div>
          </div>
        </div>
      </motion.div>

      {/* 2. INTERNAL ENGINE (SUB-SURFACE) */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: 'span 4' }}>
        <div className="status-strip" style={{ background: getStatusColor(internal.internal_risk_level) }}></div>
        <div className="badge">
          <Layers size={12} />
          VOLUMETRIC_INTERNAL_HEALTH
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '8px', background: 'rgba(0,123,255,0.05)', border: '1px solid rgba(0,123,255,0.1)' }}>
             <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               CARBONATION_DEPTH <Info size={12} />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getStatusColor(internal.carbonation_risk) }}>{internal.carbonation_risk}</div>
          </div>
          
          <div style={{ padding: '1.25rem', borderRadius: '8px', background: 'rgba(0,123,255,0.05)', border: '1px solid rgba(0,123,255,0.1)' }}>
             <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               RESONANCE_VIBRATION <Zap size={12} />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getStatusColor(internal.vibration_risk) }}>{internal.vibration_risk}</div>
          </div>

          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
             CORE_HEALTH: {internal.internal_risk_level}
          </div>
        </div>
      </motion.div>

      {/* 3. TIME ENGINE (FORECAST) */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ gridColumn: 'span 4' }}>
        <div className="status-strip" style={{ background: 'var(--secondary)' }}></div>
        <div className="badge">
          <Clock size={12} />
          STRESS-TIME FORECASTING
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
             <div>
               <div className="stat-value" style={{ color: 'var(--secondary)', fontSize: '4.5rem' }}>{time.remaining_life_years}</div>
               <div className="metric-unit">UNITS_REMAINING (Y)</div>
             </div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>{new Date().getFullYear() + time.remaining_life_years}</div>
               <div className="metric-unit">E.O.L CALCULATION</div>
             </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
             {renderForecastChart()}
             <div style={{ fontSize: '0.65rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
               <TrendingDown size={12} /> LSTM_DEGRADATION_VECTOR_PROJECTION
             </div>
          </div>
        </div>
      </motion.div>

      {/* 4. 3D STRUCTURAL CONTEXT (Large) */}
      {vision.stl_path && (
        <motion.div 
          viewport={{ once: true }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-panel" 
          style={{ gridColumn: 'span 8', minHeight: '500px' }}
        >
          <div className="badge">
            <Microscope size={12} />
            3D_STRUCTURAL_VOLUMETRIC_ANNOTATION
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>GENERATED BRACKET REPAIR GEOMETRY</h3>
          <BracketViewer stlUrl={`http://localhost:8000${vision.stl_path}`} />
        </motion.div>
      )}

      {/* 5. PROTOCOL RECOMMENDATIONS (Side) */}
      <motion.div 
        variants={itemVariants}
        className="glass-panel" 
        style={{ gridColumn: vision.stl_path ? 'span 4' : 'span 12', background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="badge">
          <Lightbulb size={12} />
          REINFORCEMENT_PROTOCOL
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {suggestions.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '1.5rem', 
                border: '1px solid var(--glass-border)',
                borderRadius: '8px', 
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: '1.5',
                display: 'flex',
                gap: '1rem',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><ShieldCheck size={20} /></div>
              {s}
            </motion.div>
          ))}
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <FileCheck size={14} /> CERTIFIED_BY_FORGE_AI_QUANTUM_LEAD
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
