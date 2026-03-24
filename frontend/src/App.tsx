import { useState } from 'react';
import './index.css';
import Dashboard from './components/Dashboard';

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [age, setAge] = useState<number>(20);
  const [loadFactor, setLoadFactor] = useState<number>(1.2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('age', age.toString());
    formData.append('load_factor', loadFactor.toString());

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Make sure the backend is running and APIs are configured.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--accent-vision), var(--accent-time))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Forge Bridge Analysis AI
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Unified pipeline: Vision crack detection ➞ Risk scoring ➞ Degradation Forecasting
        </p>
      </header>

      <div className="main-content">
        <aside>
          <form className="glass-panel" onSubmit={handleAnalyze}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Structure Data</h2>
            
            <div className="input-group">
              <label>Bridge Image (with suspected cracks)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
            </div>
            
            {imagePreview && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', display: 'block' }} />
              </div>
            )}

            <div className="input-group">
              <label>Structure Age (Years)</label>
              <input type="number" min="0" max="200" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
            </div>

            <div className="input-group">
              <label>Traffic Load Factor (1.0 = baseline)</label>
              <input type="number" step="0.1" min="0" max="5" value={loadFactor} onChange={(e) => setLoadFactor(Number(e.target.value))} required />
            </div>

            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <button type="submit" className="primary-btn" disabled={!image || loading}>
              {loading ? (
                <span className="pulse">Analyzing AI Pipeline...</span>
              ) : (
                'Run Structural Analysis'
              )}
            </button>
          </form>
        </aside>

        <main>
          {results ? (
            <Dashboard data={results} imagePreview={imagePreview} />
          ) : (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <p>Awaiting structural data input.<br/>Upload an image and run analysis to see dashboard.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
