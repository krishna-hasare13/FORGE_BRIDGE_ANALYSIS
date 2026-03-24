import React, { useState, useEffect } from 'react';
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
    formData.append('cover_depth_mm', coverDepth.toString());
    formData.append('environment', environment);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', borderBottom: '4px solid var(--primary)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', fontFamily: 'Space Grotesk' }}>FORGE_AI</h1>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-muted)' }}>[ BRIDGE_STRUCTURAL_DIAGNOSTIC_CORE_V2.0 ]</div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'Space Grotesk', fontSize: '0.75rem', fontWeight: 700 }}>
           STATUS: {loading ? 'ANALYZING...' : 'SYSTEM_IDLE'}<br/>
           DATE: {new Date().toLocaleDateString()}
        </div>
      </header>

      <div className="main-content">
        <div className="glass-panel" style={{ background: 'var(--surface-low)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: '8px', height: '8px', background: 'var(--primary)' }}></div>
             INPUT_PARAMETERS
          </h3>
          
          <form onSubmit={handleAnalyze}>
            <div className="input-group">
              <label>Structural Image_Capture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
            </div>

            <div className="input-group">
              <label>Asset_Age (Y)</label>
              <input type="number" min="0" max="200" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
            </div>

            <div className="input-group">
              <label>Live_Load_Multiplier</label>
              <input type="number" step="0.1" min="0" max="5" value={loadFactor} onChange={(e) => setLoadFactor(Number(e.target.value))} required />
            </div>

            <div className="input-group">
              <label>Rebar_Cover_Depth (MM)</label>
              <input type="number" min="1" max="100" value={coverDepth} onChange={(e) => setCoverDepth(Number(e.target.value))} required />
            </div>

            <div className="input-group">
              <label>Surrounding_Environment</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                <option value="urban">URBAN_CENTRAL</option>
                <option value="industrial">INDUSTRIAL_AGGRESSIVE</option>
                <option value="marine">MARINE_CORROSIVE</option>
                <option value="rural">RURAL_STABLE</option>
              </select>
            </div>

            <button type="submit" className="primary-btn" disabled={!image || loading}>
              {loading ? 'EXECUTING_ANALYSIS...' : 'RUN_DIAGNOSTIC_SUITE'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {imagePreview && (
            <div className="glass-panel" style={{ padding: '0', background: '#000', overflow: 'hidden', maxWidth: '600px', margin: '0 auto', aspectRatio: '1/1' }}>
              <div className="bbox-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={imagePreview} alt="Bridge" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8 }} />
                {results?.vision?.predictions?.map((pred: any, idx: number) => (
                  <div key={idx} className="bbox" style={{
                    left: `${(pred.x - pred.width / 2) / 6.4}%`, // Assuming 640px based on Roboflow defaults, but usually it should be relative to image size.
                    top: `${(pred.y - pred.height / 2) / 6.4}%`, 
                    width: `${(pred.width) / 6.4}%`,
                    height: `${(pred.height) / 6.4}%`
                  }}>
                    <div className="bbox-label">{pred.class} {Math.round(pred.confidence * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && <Dashboard data={results} />}
        </div>
      </div>
    </div>
  );
}

export default App;
