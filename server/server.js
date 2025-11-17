import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
//const GENERATED_DIR = process.env.GENERATED_DIR || 'generated';


// ensure generated dir exists
//await fs.mkdir(GENERATED_DIR, { recursive: true });


// Multer setup (store uploads in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB


// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// helper: convert buffer (PDF) to base64
async function main() {
    const contents = [
        { text: "Summarize this document" },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(fs.readFileSync("content/343019_3_art_0_py4t4l_convrt.pdf")).toString("base64")
            }
        }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents
    });
    console.log(response.text);
}