import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Generous body limit for image uploads and OCR
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * 1. Analyze Images using gemini-3.1-pro-preview
 * Supports receipt/invoice OCR, bill extraction, and product visual inspection.
 */
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'bill_ocr', customPrompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    let promptText = '';
    if (mode === 'bill_ocr') {
      promptText = `You are an expert accountant and OCR specialist for small businesses using billing software like Vyapar.
Analyze this image of a receipt, purchase bill, handwritten hisab-kitab slip, or sales invoice.
Extract the data and respond ONLY with valid JSON (no markdown formatting, no code fences, just raw JSON).
The JSON format MUST be:
{
  "partyName": "Customer or Vendor or Supplier business name or 'Cash'",
  "partyType": "Customer" | "Supplier",
  "invoiceNumber": "Bill or invoice number or auto-generated guess",
  "date": "YYYY-MM-DD (or current date if missing)",
  "items": [
    {
      "name": "Item or product description",
      "quantity": 1,
      "unit": "Pcs" | "Box" | "Kg" | "Ltr" | "Packet",
      "rate": 100.0,
      "taxPercent": 0,
      "amount": 100.0
    }
  ],
  "subtotal": 100.0,
  "taxAmount": 0.0,
  "grandTotal": 100.0,
  "amountPaid": 100.0,
  "paymentMode": "Cash" | "UPI" | "Bank Transfer",
  "notes": "Any handwritten notes or remarks found on bill"
}
Ensure numbers are numeric floats or integers. If any field cannot be determined, make a reasonable guess.`;
    } else if (mode === 'product_inspect') {
      promptText = `You are an expert retail inventory manager.
Examine this product photo and extract product inventory details.
Respond ONLY with valid JSON (no markdown formatting, no code fences, just raw JSON):
{
  "name": "Concise product title",
  "category": "Electronics" | "Groceries" | "Hardware" | "Apparel" | "Stationery" | "General",
  "description": "Brief 1-2 sentence description",
  "suggestedSalePrice": 250.0,
  "suggestedPurchasePrice": 180.0,
  "unit": "Pcs" | "Box" | "Kg" | "Packet",
  "sku": "Auto generated SKU or barcode guess",
  "taxRate": 18,
  "condition": "New" | "Boxed" | "Open-box"
}`;
    } else {
      promptText = customPrompt || 'Analyze this business document, image, or product in detail and extract key information.';
    }

    // Call gemini-3.1-pro-preview as explicitly required
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [imagePart, { text: promptText }],
      },
    });

    const responseText = response.text || '';

    // If expecting JSON, try parsing it cleanly
    if (mode === 'bill_ocr' || mode === 'product_inspect') {
      try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed, rawText: responseText });
      } catch {
        return res.json({ success: true, data: null, rawText: responseText });
      }
    }

    return res.json({ success: true, rawText: responseText });
  } catch (error: any) {
    console.error('Error analyzing image with gemini-3.1-pro-preview:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

/**
 * 2. Create & Edit Images using gemini-3.1-flash-image-preview
 * Supports creating business logos, promotional banners, or editing item visuals.
 */
app.post('/api/gemini/create-edit-image', async (req, res) => {
  try {
    const { prompt, inputImageBase64, mimeType = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const parts: any[] = [];

    // If user provided an existing image to edit/enhance
    if (inputImageBase64) {
      const cleanBase64 = inputImageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    parts.push({ text: prompt });

    // Use gemini-3.1-flash-image-preview (with fallback to gemini-3.1-flash-image if model alias resolves)
    let modelName = 'gemini-3.1-flash-image-preview';
    let response: any;

    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });
    } catch (modelErr: any) {
      // Fallback to standard alias gemini-3.1-flash-image if preview alias is not found
      console.warn(`Fallback from ${modelName} to gemini-3.1-flash-image:`, modelErr?.message);
      modelName = 'gemini-3.1-flash-image';
      response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });
    }

    // Look for generated image in parts
    let imageUrl = '';
    let textResponse = '';

    const candidate = response?.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image was returned from the model.',
        details: textResponse,
      });
    }

    return res.json({
      success: true,
      imageUrl,
      text: textResponse,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error('Error in create-edit-image:', error);
    return res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

/**
 * 3. Download Source Code & Android Bundle endpoints
 */
app.get('/api/download/source-code', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'downloads', 'hisab-kitab-source.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'hisab-kitab-pro-source.zip');
  } else {
    res.status(404).json({ error: 'Source code archive not found' });
  }
});

app.get('/api/download/android-project', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'downloads', 'hisab-kitab-android.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'hisab-kitab-android-studio-project.zip');
  } else {
    res.status(404).json({ error: 'Android project archive not found' });
  }
});

// Configure Vite integration for dev server or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HISAB KITAB server running on port ${PORT}`);
  });
}

startServer();
