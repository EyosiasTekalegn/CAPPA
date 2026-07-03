import express from "express";
import serverless from 'serverless-http';
import { Resend } from 'resend';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Firebase
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Log if API key is loaded
console.log('🔑 Resend API Key loaded:', process.env.RESEND_API_KEY ? '✅ Yes' : '❌ No');

const app = express();
app.use(express.json({ limit: "25mb" }));

// Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } })
  : null;

// ------------------- API Routes -------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

app.get("/api/data", async (req, res) => {
  try {
    const collections = ['properties','testimonials','blogs','projects','popup_ads','users','messages'];
    const dataDict: any = {};
    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      dataDict[col] = snap.docs.map(d => d.data());
    }
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    dataDict.globalSettings = settingsSnap.exists() ? settingsSnap.data() : {};
    res.json(dataDict);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get("/api/export-zip", (req, res) => {
  // ... (keep your existing zip code)
});

app.post("/api/gemini", async (req, res) => {
  // ... (keep your existing Gemini code)
});

// ================================================================
// 📧 SEND REPLY EMAIL ENDPOINT (This is what you're missing!)
// ================================================================
app.post("/api/send-reply", async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    console.log('📧 Sending email to:', to);
    console.log('📝 Subject:', subject);

    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // ⚠️ IMPORTANT: Use sandbox domain for testing (no verification needed)
    // Switch to your custom domain after verifying in Resend
    const from = 'Cappadocia Real Estate <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data?.id);
    res.status(200).json({ success: true, messageId: data?.id });
  } catch (err: any) {
    console.error('❌ Send email error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to send' });
  }
});

// Export for Vercel
export default serverless(app);
