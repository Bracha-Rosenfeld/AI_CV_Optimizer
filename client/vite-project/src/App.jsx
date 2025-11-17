// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import React, { useState } from 'react';


export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [generatedFilename, setGeneratedFilename] = useState(null);


  const submit = async () => {
    if (!file) return alert('Please select a PDF');
    setLoading(true);
    const form = new FormData();
    form.append('cv', file);
    form.append('jobDescription', jobDescription);


    try {
      const resp = await fetch('http://localhost:4000/api/optimize-for-job', {
        method: 'POST',
        body: form,
      });
      const data = await resp.json();
      setAnalysis(data.analysis);
      setGeneratedFilename(data.filename);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>CV Optimizer (Gemini)</h2>
      <div>
        <label>Upload PDF CV:</label>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      </div>
      <div style={{ marginTop: 10 }}>
        <label>Job description (for role-specific optimization):</label>
        <textarea rows={6} value={jobDescription} onChange={e => setJobDescription(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={submit} disabled={loading}>{loading ? 'Working...' : 'Optimize'}</button>
      </div>


      {analysis && (
        <div style={{ marginTop: 20 }}>
          <h3>Analysis</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}


      {generatedFilename && (
        <div style={{ marginTop: 10 }}>
          <a href={`http://localhost:4000/api/download/${generatedFilename}`} target="_blank" rel="noreferrer">Download improved PDF</a>
        </div>
      )}
    </div>
  );
}