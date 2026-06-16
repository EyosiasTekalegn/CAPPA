import express from "express";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import serverless from 'serverless-http';
import { Resend } from 'resend';

dotenv.config();

// ========== Firebase initialization ==========
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// ========== Email client (Resend) ==========
// Use environment variable or fallback to the provided key
const resendApiKey = process.env.RESEND_API_KEY || 're_FDYk8vqb_H3tnKf1nPkbGKfpgEkzNYo1Q';
const resend = new Resend(resendApiKey);

const app = express();
app.use(express.json({ limit: "25mb" }));

// ========== Gemini client ==========
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } })
  : null;

// ========== API ROUTES ==========

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// Fetch Firestore data
app.get("/api/data", async (req, res) => {
  try {
    const collectionsToFetch = ['properties', 'testimonials', 'blogs', 'projects', 'popup_ads', 'users', 'messages'];
    const dataDict: Record<string, any[]> = {};
    for (const colName of collectionsToFetch) {
      const querySnapshot = await getDocs(collection(db, colName));
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => list.push(docSnap.data()));
      dataDict[colName] = list;
    }
    let globalSettings = {};
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) globalSettings = docSnap.data();
    } catch (err) { console.error("Failed to get global settings:", err); }
    res.json({ ...dataDict, globalSettings });
  } catch (err) {
    console.error("Failed to fetch data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Export ZIP
app.get("/api/export-zip", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();
    function scanAndAdd(currentPath: string, zipPathPrefix: string) {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const relativeZipPath = zipPathPrefix ? `${zipPathPrefix}/${item}` : item;
        if (
          item === "node_modules" || item === ".git" || item === "dist" ||
          item === ".cache" || item === "coverage" ||
          (item.startsWith(".") && item !== ".gitignore" && item !== ".env.example" && item !== ".env" && item !== ".firebaserc") ||
          item.endsWith(".zip")
        ) continue;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) scanAndAdd(fullPath, relativeZipPath);
        else zip.addFile(relativeZipPath, fs.readFileSync(fullPath));
      }
    }
    scanAndAdd(rootDir, "");
    const zipBuffer = zip.toBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="cappadocia-project-full-source.zip"');
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err) {
    console.error("ZIP export failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate ZIP export" });
  }
});

// Gemini AI
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    if (!ai) return res.status(500).json({ error: "Gemini API Key not configured" });
    const parts: any[] = [{ text: prompt }];
    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Failed to retrieve image: ${imgRes.status}`);
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({ inlineData: { mimeType, data: buffer.toString("base64") } });
      } catch (imgErr) {
        return res.status(400).json({ error: `Failed to load image: ${imgErr instanceof Error ? imgErr.message : "Unknown error"}` });
      }
    }
    const response = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: { parts } });
    res.json({ text: response.text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Gemini call failed" });
  }
});

// ========== EMAIL REPLY ENDPOINT ==========
app.post("/api/send-reply", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // Basic validation
    if (!to || !subject || !text) {
      return res.status(400).json({ error: "Missing required fields: to, subject, text" });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Cappadocia Real Estate <noreply@cappadocia.com>', // Change to your verified domain
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    console.log('Email sent successfully:', data);
    res.status(200).json({
      success: true,
      messageId: data?.id,
      message: "Reply sent successfully",
    });
  } catch (err) {
    console.error("Error sending reply email:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to send reply" });
  }
});

// ========== STATIC FILE SERVING (for local dev only) ==========
// On Vercel, static files are served separately – this block only runs in development.
if (process.env.NODE_ENV !== "production") {
  // Local development: use Vite middleware
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  })();
} else {
  // In production (Vercel), we could serve static files, but it's better to let Vercel handle it.
  // However, if you want to keep the option, uncomment the lines below.
  // const distPath = path.join(__dirname, '..', 'dist');
  // app.use(express.static(distPath));
  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(distPath, "index.html"));
  // });
}

// ====== EXPORT FOR VERCEL ======
// Vercel expects a default export for serverless functions
export default serverless(app);

// ====== LOCAL DEVELOPMENT (optional) ======
// This block runs when you start the server directly (e.g., npm run dev)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = 3000;
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Local dev server running on http://localhost:${PORT}`);
    });
  })();
}
