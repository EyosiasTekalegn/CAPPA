import express from "express";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

dotenv.config();

// Firebase initialization for server-side
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Permit larger JSON payload parsing in case of base64 transfer or large requests
  app.use(express.json({ limit: "25mb" }));

  // Initialize Gemini client on the server side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // Live Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiConfigured: !!ai });
  });

  // API to fetch dynamic data from Firestore
  app.get("/api/data", async (req, res) => {
    try {
      const collectionsToFetch = ['properties', 'testimonials', 'blogs', 'projects', 'popup_ads', 'users', 'messages'];
      const dataDict: Record<string, any[]> = {};

      for (const colName of collectionsToFetch) {
        const querySnapshot = await getDocs(collection(db, colName));
        const list: any[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        dataDict[colName] = list;
      }

      // Fetch global settings
      let globalSettings = {};
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'global'));
        if (docSnap.exists()) {
          globalSettings = docSnap.data();
        }
      } catch (err) {
        console.error(`- Failed to retrieve global settings:`, err);
      }

      res.json({ ...dataDict, globalSettings });
    } catch (err) {
      console.error("Failed to fetch data from Firestore:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  // Export ZIP endpoint
  app.get("/api/export-zip", (req, res) => {
    try {
      const zip = new AdmZip();
      const rootDir = process.cwd();
      
      // Recursive directory scanner adding files via buffer to prevent adm-zip path quirks
      function scanAndAdd(currentPath: string, zipPathPrefix: string) {
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const relativeZipPath = zipPathPrefix ? `${zipPathPrefix}/${item}` : item;
          
          // Exclude bulky and temporary directories or hidden files
          if (
            item === "node_modules" || 
            item === ".git" || 
            item === "dist" || 
            item === ".cache" ||
            item === "coverage" ||
            (item.startsWith(".") && item !== ".gitignore" && item !== ".env.example" && item !== ".env" && item !== ".firebaserc") || 
            item.endsWith(".zip")
          ) {
            continue;
          }
          
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanAndAdd(fullPath, relativeZipPath);
          } else {
            const fileBuffer = fs.readFileSync(fullPath);
            zip.addFile(relativeZipPath, fileBuffer);
          }
        }
      }

      // Scan starting from the root directory
      scanAndAdd(rootDir, "");

      const zipBuffer = zip.toBuffer();
      
      res.setHeader("Content-Disposition", 'attachment; filename="cappadocia-project-full-source.zip"');
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Length", zipBuffer.length.toString());
      res.send(zipBuffer);
    } catch (err) {
      console.error("Failed to generate ZIP export:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate ZIP export: " + (err instanceof Error ? err.message : String(err)) });
      }
    }
  });

  // AI Generation with Gemini
  app.post("/api/gemini", async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, imageUrl } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API Key is not configured in environment variables. Please set the GEMINI_API_KEY secret in Settings > Secrets.",
        });
      }

      const parts: any[] = [{ text: prompt }];

      if (imageUrl) {
        try {
          // Fetch image buffer from the Firebase Storage URL and feed to Gemini
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) {
            throw new Error(`Failed to retrieve image: ${imgRes.status} ${imgRes.statusText}`);
          }
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

          parts.push({
            inlineData: {
              mimeType,
              data: buffer.toString("base64"),
            },
          });
        } catch (imgErr) {
          console.error("Error loading image for Gemini:", imgErr);
          return res.status(400).json({
            error: `Failed to load image from Firebase Storage URL: ${imgErr instanceof Error ? imgErr.message : "Malformed image link"}`,
          });
        }
      }

      // Generate contents using gemini-3.5-flash as the default task model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
      });

      res.json({ text: response.text });
    } catch (err) {
      console.error("Gemini API integration error:", err);
      res.status(500).json({
        error: err instanceof Error ? err.message : "An error occurred during Gemini model call.",
      });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting up on port ${PORT}`);
  });
}

startServer();
