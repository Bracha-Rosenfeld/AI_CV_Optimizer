import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// Ensure generated directory exists
// ----------------------------------------------------
const GENERATED_DIR = path.join(process.cwd(), 'generated');
await fs.mkdir(GENERATED_DIR, { recursive: true });

// ----------------------------------------------------
// Multer setup - store uploads in memory
// ----------------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ----------------------------------------------------
// Initialize Google Gemini
// ----------------------------------------------------
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
// ----------------------------------------------------
// Route: GET /api/download/:filename - download PDF with headers and optional deletion
// ----------------------------------------------------
app.get('/api/download/:filename', async (req, res) => {
    console.log("Download request received");
    const filename = req.params.filename;
    const filePath = path.join(GENERATED_DIR, filename);
    const log = "File name: " + filename + " File path: " + filePath;
    console.log(log);

    try {
        await fs.access(filePath); 

        // הגדרת headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // שליחת הקובץ
        const stream = fsSync.createReadStream(filePath);
        stream.pipe(res);

        // אופציונלי: מחיקת הקובץ אחרי הורדה
        // stream.on('end', async () => {
        //     try {
        //         await fs.unlink(filePath);
        //         console.log(`Deleted file: ${filename}`);
        //     } catch (err) {
        //         console.error('Error deleting file:', err);
        //     }
        // });

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).end();
        });

    } catch {
        res.status(404).json({ error: "File not found." });
    }
});


// ----------------------------------------------------
// Route: POST /api/optimize - CV optimization
// ----------------------------------------------------
app.post('/api/optimize', upload.single('cv'), async (req, res) => {
    try {
        const jobDescription = req.body.job || "Optimize this CV for general use.";
        const file = req.file;

        if (!file) {
            console.log("File not found");
            return res.status(400).json({ error: "No PDF file uploaded." });
        }

        const base64pdf = file.buffer.toString("base64");

        const isHebrew = /[\u0590-\u05FF]/.test(jobDescription);
        const targetLanguage = isHebrew ? "hebrew" : "english";
        const contents = [
            {
                text: `
                You are a professional CV optimization assistant.

The user uploaded a CV (PDF) and provided a job description (can be in Hebrew or English):\n${jobDescription}

Instructions:

1. Rewrite the CV in ${targetLanguage} -  the same language as the job description.
2. Do NOT invent any information or add fictional details. Stick strictly to the facts provided in the original CV.
3. Your task is only to:
   - Improve phrasing
   - Reorganize sections for clarity and professional appearance
   - Emphasize skills and experiences relevant to the job description
   - Remove or de-emphasize details that are not relevant
4. Begin your response with a concise explanation of the changes you made. Include:
   - Key improvements in phrasing
   - Skills emphasized
   - Sections reorganized or clarified
5. After the explanation, output the **client-ready CV content**.
   - Clearly mark the beginning and end of this section with:
     --- CLIENT CV START ---
     ...client-ready CV content...
     --- CLIENT CV END ---
6. Make sure the client CV is professional, well-structured, concise, and easy to read.
7. If the language is Hebrew, preserve correct spelling and order. Format for readability, but do not invent new content.

Attached is the PDF CV`
            },
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64pdf
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents
        });

        const fullText = response.text || "";

        // *** CHANGED: use the new client CV markers ***
        const CLIENT_START = "--- CLIENT CV START ---";
        const CLIENT_END = "--- CLIENT CV END ---";

        // extract pdf text (everything before client CV) and client CV content
        const startIndex = fullText.indexOf(CLIENT_START);
        const endIndex = fullText.indexOf(CLIENT_END);

        let pdfText = fullText;
        let clientText = "";

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            clientText = fullText.slice(0, startIndex).trim();
            pdfText = fullText.slice(startIndex + CLIENT_START.length, endIndex).trim();
        }

        let pdfContent = pdfText || "";
        let frontendContent = clientText || "";


        // Create PDF
        const filename = `optimized_${Date.now()}.pdf`;
        const filePath = path.join(GENERATED_DIR, filename);

        const pdf = new PDFDocument();
        const writer = pdf.pipe(fsSync.createWriteStream(filePath));

        if (isHebrew) {
            pdf.registerFont('Alef', path.join(__dirname, 'fonts', 'Alef-Regular.ttf'));
            pdf.font('Alef').fontSize(14);
        } else {
            pdf.registerFont('Helvetica', path.join(__dirname, 'fonts', 'LiberationSans-Regular.ttf'));
            pdf.font('Helvetica').fontSize(14);
        }

        if (isHebrew) {
            pdfContent = pdfContent
                .split('\n')
                .map(line => line.split(' ').reverse().join(' '))
                .join('\n');
        }


        let cleanedText = pdfContent.replace(/\*+/g, ' ').trim();

        pdf.text(cleanedText, {
            align: isHebrew ? 'right' : 'left',
            lineGap: 2
        });


        pdf.end();

        writer.on("finish", () => {
            res.json({
                filename,
                frontendContent
            });
        });

    } catch (err) {
        console.error("Optimization error:", err);
        res.status(500).json({ error: "Server error during optimization." });
    }
});


// ----------------------------------------------------
// Route: GET /api/download/:filename - download PDF
// ----------------------------------------------------
app.get('/api/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(GENERATED_DIR, filename);

    try {
        await fs.access(filePath);
        res.download(filePath);
    } catch {
        res.status(404).json({ error: "File not found." });
    }
});

// ----------------------------------------------------
// Start server
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
