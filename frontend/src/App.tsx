import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Settings,
  ChevronRight,
  Database,
  Globe,
  Terminal,
  Activity,
  Box as BoxIcon,
  XCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [age, setAge] = useState<number>(20);
  const [loadFactor, setLoadFactor] = useState<number>(1.2);
  const [coverDepth, setCoverDepth] = useState<number>(40);
  const [environment, setEnvironment] = useState<string>("urban");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('forge_ai_results');
    const savedPreview = localStorage.getItem('forge_ai_preview');
    
    if (savedResults) {
      try { setResults(JSON.parse(savedResults)); } catch (e) { console.error(e); }
    }
    if (savedPreview) {
      setImagePreview(savedPreview);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (results) localStorage.setItem('forge_ai_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (imagePreview) {
      try {
        localStorage.setItem('forge_ai_preview', imagePreview);
      } catch {
        console.warn("Image too large for localStorage persistence");
      }
    }
  }, [imagePreview]);

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    localStorage.removeItem('forge_ai_results');
    localStorage.removeItem('forge_ai_preview');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('age', age.toString());
    formData.append('load_factor', loadFactor.toString());
    formData.append('cover_depth_mm', coverDepth.toString());
    formData.append('environment', environment);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResults(data);

      // Auto-scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 900, behavior: 'smooth' });
      }, 500);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Analysis aborted');
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="container">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          marginBottom: '4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px' }}>
            {/* Forge AI Premium Circular Logo Recreation */}
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0062ff" />
                  <stop offset="100%" stopColor="#001144" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#logoGrad)" />
              <path d="M 30,50 L 70,25 L 70,40 L 50,50 L 70,60 L 70,75 Z" fill="white" />
            </svg>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: 'white',
              fontFamily: 'Outfit'
            }}>FORGE AI</h1>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '0.3em', marginTop: '0.25rem' }}>QUANTUM_STRUCTURAL_ANALYSIS_ENGINE</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px' }}>SYSTEM_STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: loading ? 'var(--warning)' : 'var(--success)', boxShadow: `0 0 10px ${loading ? 'var(--warning)' : 'var(--success)'}` }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{loading ? 'ANALYZING' : 'IDLE'}</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </motion.header>

      {results && results.risk.risk_score > 90 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.3) 50%, rgba(255,0,0,0.1) 100%)',
            border: '1px solid rgba(255,0,0,0.5)',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#ffaaaa',
            fontWeight: 800,
            letterSpacing: '3px',
            fontSize: '0.9rem',
            boxShadow: '0 0 30px rgba(255,0,0,0.4)',
            zIndex: 1000,
            position: 'relative'
          }}
        >
          <span style={{ color: '#ff0000', marginRight: '10px' }}>&#9888;</span> CRITICAL_RED_ALERT: STRUCTURAL_FAILURE_THRESHOLD_EXCEEDED <span style={{ color: '#ff0000', marginLeft: '10px' }}>&#9888;</span>
        </motion.div>
      )}

      <div className="main-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '3rem' }}>
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel"
          style={{ height: 'fit-content', borderTop: '4px solid var(--primary)' }}
        >
          <div className="badge">
            <Settings size={12} />
            DIAGNOSTIC_CONTROL_UNIT
          </div>

          <form onSubmit={handleAnalyze} style={{ marginTop: '1rem' }}>
            <div className="input-group">
              <label><Scan size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> IMAGE_CAPTURE_SOURCE</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                <label><Database size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> ASSET_AGE</label>
                <input type="number" min="0" max="200" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
                </div>

                <div className="input-group">
                <label><Activity size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> LOAD_MULT</label>
                <input type="number" step="0.1" min="0" max="5" value={loadFactor} onChange={(e) => setLoadFactor(Number(e.target.value))} required />
                </div>
            </div>

            <div className="input-group">
              <label><BoxIcon size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> REBAR_DEPTH (MM)</label>
              <input type="number" min="1" max="100" value={coverDepth} onChange={(e) => setCoverDepth(Number(e.target.value))} required />
            </div>

            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <label><Globe size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> ENV_SPECIFICATION</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                <option value="urban">URBAN_CENTRAL_STANDARD</option>
                <option value="industrial">INDUSTRIAL_AGGRESSIVE_ZONE</option>
                <option value="marine">MARINE_STRESS_CORROSIVE</option>
                <option value="rural">RURAL_STABLE_ATMOSPHERE</option>
              </select>
            </div>

            {!loading ? (
              <button type="submit" className="primary-btn" disabled={!image} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                 <Terminal size={18} /> RUN_DIAGNOSTIC_SUITE <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={cancelAnalysis} className="primary-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'rgba(255, 0, 0, 0.2)', color: '#ff4444', borderColor: 'rgba(255,0,0,0.3)' }}>
                 <XCircle size={18} /> ABORT_ANALYSIS
              </button>
            )}

            {results && !loading && (
              <button type="button" onClick={handleReset} className="primary-btn" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}>
                 <RotateCcw size={18} /> START_NEW_SESSION
              </button>
            )}
          </form>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ padding: '2px', background: '#000', overflow: 'hidden', height: '220px', minHeight: '180px', maxWidth: '400px', margin: '0 auto' }}
              >
                <div className="bbox-container" style={{ position: 'relative', width: '100%', height: '100%', background: '#05070a' }}>
                  {loading && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <Loader2 size={48} className="spin-slow" color="var(--primary)" />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: '3px', fontSize: '0.9rem' }}>NEURAL_PROCESSING_ACTIVE</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem' }}>QUANTIZING_STRUCTURAL_TENSORS...</div>
                        </div>
                    </div>
                  )}
                  <img src={imagePreview} alt="Bridge" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', opacity: (results && !loading) ? 0.7 : 1, transition: 'opacity 0.5s ease' }} />
                  {results?.vision?.predictions?.map((pred: any, idx: number) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bbox" 
                      style={{
                        left: `${(pred.x - pred.width / 2) / 6.4}%`, 
                        top: `${(pred.y - pred.height / 2) / 6.4}%`, 
                        width: `${(pred.width) / 6.4}%`,
                        height: `${(pred.height) / 6.4}%`,
                        borderColor: 'var(--secondary)',
                        borderWidth: '2px',
                        boxShadow: '0 0 15px var(--secondary)'
                      }}
                    >
                      <div className="bbox-label" style={{ background: 'var(--secondary)', color: 'black' }}>{pred.class} {Math.round(pred.confidence * 100)}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                 <Dashboard data={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <footer style={{ marginTop: '6rem', padding: '3rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px' }}>
          &copy; {new Date().getFullYear()} FORGE AI // ADVANCED STRUCTURAL ANALYTICS DIV. ALL RIGHTS SECURED.
      </footer>

      <style>{`
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
