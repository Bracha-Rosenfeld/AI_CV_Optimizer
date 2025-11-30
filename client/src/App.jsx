import styles from './App.module.css';
import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [cvFile, setCvFile] = useState(null);
  const [jobListing, setJobListing] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState("");
  const [pdfFilename, setPdfFilename] = useState(null);

  const handleFileUpload = (e) => {
    setCvFile(e.target.files[0]);
  };

  const analyzeCV = async () => {
    if (!cvFile) {
      alert("Please upload a CV PDF file.");
      return;
    }

    try {
      setLoading(true);
      setResults("");
      setPdfFilename(null);

      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("job", jobListing);

      const response = await axios.post("http://localhost:3000/api/optimize", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResults(response.data.frontendContent || "No results returned.");
      setPdfFilename(response.data.filename);
    } catch (err) {
      console.error(err);
      alert("Error analyzing CV.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfFilename) return;
    window.location.href = `http://localhost:3000/api/download/${pdfFilename}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>CV Optimizer</h1>
        
        {/* Job Listing */}
        <div className={styles.inputSection}>
          <label className={styles.label}>Job Description (Optional)</label>
          <textarea 
            className={styles.textarea}
            rows="4"
            value={jobListing}
            onChange={(e) => setJobListing(e.target.value)}
            placeholder="Paste the job listing here..."
          ></textarea>
        </div>

        {/* File Upload */}
        <div className={styles.inputSection}>
          <label className={styles.label}>Upload CV (PDF Only)</label>
          <div className={styles.fileUploadWrapper}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyzeCV}
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            "Optimize CV"
          )}
        </button>

        {/* Results */}
        {results && (
          <div className={styles.resultsBox}>
            <h2 className={styles.resultsTitle}>AI Suggestions</h2>
            {results}
          </div>
        )}

        {/* Download PDF */}
        {pdfFilename && (
          <button onClick={downloadPDF} className={styles.downloadButton}>
            Download Optimized PDF
          </button>
        )}
      </div>
    </div>
  );
}