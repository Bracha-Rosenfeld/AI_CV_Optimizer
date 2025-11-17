// import React, { useState } from "react";
// import axios from "axios";

// export default function App() {
//   const [cvFile, setCvFile] = useState(null);
//   const [jobListing, setJobListing] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState("");
//   const [pdfFilename, setPdfFilename] = useState(null);

//   const handleFileUpload = (e) => {
//     setCvFile(e.target.files[0]);
//   };

//   const analyzeCV = async () => {
//     if (!cvFile) {
//       alert("Please upload a CV PDF file.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setResults("");
//       setPdfFilename(null);

//       const formData = new FormData();
//       formData.append("cv", cvFile);
//       formData.append("job", jobListing);

//       const response = await axios.post("http://localhost:3000/api/optimize", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       setResults(response.data.frontendContent || "No results returned.");
//       setPdfFilename(response.data.filename);
//     } catch (err) {
//       console.error(err);
//       alert("Error analyzing CV.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadPDF = () => {
//     if (!pdfFilename) return;

//     window.location.href = `http://localhost:3000/api/download/${pdfFilename}`;
//   };

//   return (
//     <div className="p-10 max-w-3xl mx-auto space-y-6 text-gray-800">
//       <h1 className="text-3xl font-bold mb-4">CV Optimization with Gemini AI</h1>

//       <div className="space-y-3">
//         <label className="font-semibold">Job Description (Optional)</label>
//         <textarea
//           className="w-full p-3 border rounded-lg"
//           rows="4"
//           value={jobListing}
//           onChange={(e) => setJobListing(e.target.value)}
//           placeholder="Paste the job listing here..."
//         ></textarea>
//       </div>

//       <div className="space-y-2">
//         <label className="font-semibold">Upload CV (PDF Only)</label>
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={handleFileUpload}
//         />
//       </div>

//       <button
//         onClick={analyzeCV}
//         disabled={loading}
//         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//       >
//         {loading ? "Analyzing..." : "Optimize CV"}
//       </button>

//       {results && (
//         <div className="p-4 border rounded-lg bg-gray-100 whitespace-pre-wrap">
//           <h2 className="font-bold text-xl mb-2">AI Suggestions</h2>
//           {results}
//         </div>
//       )}

//       {pdfFilename && (
//         <button
//           onClick={downloadPDF}
//           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
//         >
//           Download Optimized PDF
//         </button>
//       )}
//     </div>
//   );
// }
import './index.css';
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 drop-shadow">CV Optimizer</h1>

        {/* Job Listing */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-700">Job Description (Optional)</label>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 outline-none"
            rows="4"
            value={jobListing}
            onChange={(e) => setJobListing(e.target.value)}
            placeholder="Paste the job listing here..."
          ></textarea>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <label className="font-semibold text-gray-700">Upload CV (PDF Only)</label>

          <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="w-full text-gray-700"
            />
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyzeCV}
          disabled={loading}
          className="w-full py-3 text-lg font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 transition"
        >
          {loading ? (
            <div className="flex justify-center items-center space-x-3">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            "Optimize CV"
          )}
        </button>

        {/* Results */}
        {results && (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-xl shadow-inner whitespace-pre-wrap">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">AI Suggestions</h2>
            {results}
          </div>
        )}

        {/* Download PDF */}
        {pdfFilename && (
          <button
            onClick={downloadPDF}
            className="w-full py-3 text-lg font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 transition"
          >
            Download Optimized PDF
          </button>
        )}
      </div>
    </div>
  );
}
