import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Brainstorm logo concepts using gemini-3.8-flash
app.post('/api/suggest-concepts', async (req: Request, res: Response) => {
  try {
    const { companyName, industry, description, vibe } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a world-class brand identity designer and creative director.
Generate 4 diverse, high-impact logo design concepts for the following brand:
Company Name: "${companyName || 'Untitled Brand'}"
Industry: "${industry || 'Technology & Innovation'}"
Vibe / Tone: "${vibe || 'Modern, Premium, Memorable'}"
Company Description: "${description || 'An innovative forward-thinking enterprise.'}"

Provide 4 distinct concepts in JSON format with:
- id: string (e.g. concept-1)
- title: catchy concept name (e.g. "Geometric Kinetic Monogram")
- style: design category (e.g. "Minimalist Vector", "3D Glassmorphism", "Cyberpunk Neon", "Luxury Crest")
- colorPalette: array of 3 hex colors or color names
- iconDescription: brief 1-2 sentence description of the visual symbol
- imagePrompt: precise visual prompt optimized for an AI image generator to produce an ultra-clean, professional company logo on a clean backdrop. Specify no realistic mockups, no photo frames, pure logo symbol on clean background.
- animationPrompt: cinematic motion direction to animate this logo into a video with Veo (e.g. camera motion, particle effects, lighting sweeps)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandSummary: { type: Type.STRING },
            taglineSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  style: { type: Type.STRING },
                  colorPalette: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  iconDescription: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  animationPrompt: { type: Type.STRING },
                },
                required: ['id', 'title', 'style', 'colorPalette', 'iconDescription', 'imagePrompt', 'animationPrompt'],
              },
            },
          },
          required: ['brandSummary', 'taglineSuggestions', 'concepts'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating logo concepts:', error);
    return res.status(500).json({
      error: error.message || 'Failed to suggest concepts',
    });
  }
});

// 2. High-quality logo image generation using gemini-3-pro-image-preview
// Supports image sizes: 1K, 2K, 4K
app.post('/api/generate-logo', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K', styleHint = '' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    // Ensure prompt is tailored for graphic logo output
    const enhancedPrompt = `${prompt}. Professional vector graphic logo design, centered, vector artwork, clean edges, crisp geometry, master branding asset, isolated emblem on clean solid background, high aesthetic quality, award-winning graphic design, no watermarks, no photorealistic desk frames, no business cards, pure logo asset.`;

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const validImageSizes = ['1K', '2K', '4K'];
    const selectedImageSize = validImageSizes.includes(imageSize) ? imageSize : '1K';

    console.log(`Generating logo image with gemini-3-pro-image-preview, size: ${selectedImageSize}, aspect: ${selectedAspectRatio}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: selectedAspectRatio,
          imageSize: selectedImageSize,
        },
      },
    });

    let base64Image = '';
    let mimeType = 'image/png';
    let textExplanation = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        } else if (part.text) {
          textExplanation += part.text + ' ';
        }
      }
    }

    if (!base64Image) {
      return res.status(502).json({
        error: 'No image data returned from Gemini. Model response: ' + (textExplanation.slice(0, 200) || 'empty'),
      });
    }

    return res.json({
      imageUrl: `data:${mimeType};base64,${base64Image}`,
      rawBase64: base64Image,
      mimeType,
      imageSize: selectedImageSize,
      aspectRatio: selectedAspectRatio,
    });
  } catch (error: any) {
    console.error('Error generating logo image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate logo image',
    });
  }
});

// 3. Video generation using veo-3.1-fast-generate-preview
// Supports aspectRatio: 16:9 (landscape) or 9:16 (portrait)
// Accepts uploaded photo OR freshly generated logo as starting image
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { image, prompt, aspectRatio = '16:9', resolution = '720p' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required to animate' });
    }

    const ai = getGeminiClient();

    // Clean base64 string
    let cleanBase64 = image;
    let mimeType = 'image/png';

    if (image.includes(',')) {
      const parts = image.split(',');
      const match = parts[0].match(/data:(.*?);base64/);
      if (match) {
        mimeType = match[1];
      }
      cleanBase64 = parts[1];
    }

    const validAspectRatios = ['16:9', '9:16'];
    const selectedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    const validResolutions = ['720p', '1080p'];
    const selectedResolution = validResolutions.includes(resolution) ? resolution : '720p';

    const motionPrompt = prompt || 'Cinematic 3D logo animation reveal, smooth rotating motion with glowing lights, subtle particle dust and dramatic lighting sweeps on clean dark background.';

    console.log(`Starting video generation with veo-3.1-fast-generate-preview, aspect: ${selectedAspectRatio}, res: ${selectedResolution}`);

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: motionPrompt,
      image: {
        imageBytes: cleanBase64,
        mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: selectedResolution,
        aspectRatio: selectedAspectRatio,
      },
    });

    console.log(`Veo operation initiated: ${operation.name}`);

    return res.json({
      operationName: operation.name,
      aspectRatio: selectedAspectRatio,
      resolution: selectedResolution,
    });
  } catch (error: any) {
    console.error('Error initiating video generation:', error);
    return res.status(500).json({
      error: error.message || 'Failed to initiate video generation',
    });
  }
});

// 4. Video status polling
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
      metadata: updated.metadata || null,
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    return res.status(500).json({
      error: error.message || 'Failed to poll video status',
    });
  }
});

// 5. Video download and stream
app.post('/api/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return res.status(400).json({ error: 'Video generation is still in progress' });
    }

    if (updated.error) {
      return res.status(500).json({ error: updated.error.message || 'Video generation failed' });
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(500).json({ error: 'Video URI not found in operation response' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to download video from storage: ${videoRes.statusText}`,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="animated-logo.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error downloading video:', error);
    return res.status(500).json({
      error: error.message || 'Failed to download video',
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`LogoMotion server running on http://localhost:${port}`);
  });
}

startServer();
