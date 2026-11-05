import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Server-side Gemini AI generation route
app.post('/api/social/generate', async (req, res) => {
  try {
    const { platform, topic, tone, bikeModel, keywords, businessName, destinations } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        fallback: true,
        message: 'No valid GEMINI_API_KEY on server. Use client-side curated templates.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetTownsStr = Array.isArray(destinations) && destinations.length > 0 
      ? destinations.join(', ') 
      : 'San Felipe, Liwliwa, San Narciso, Cabangan, and San Antonio Zambales';
    const bizName = businessName || 'RideOut Zambales Moto Rental';

    const prompt = `You are a viral social media growth expert and content director for "${bizName}", a premier motorcycle rental business in the Philippines.
Create an engaging, viral-ready social media post for ${(platform || 'tiktok').toUpperCase()}.
Topic: ${topic || 'scenic_route'}
Tone: ${tone || 'Adventurous & Inspiring'}
Featured Motorbike: ${bikeModel || 'All-fleet'}
Targeted Nearby Towns & Coastline: ${targetTownsStr}
Additional context/keywords: ${keywords || 'Scenic coastal ride, reliable automatic scooters and dual-sport bikes, sanitized helmets, transparent 360 inspection, flexible cash or physical ID deposit, verified Code A/A1 licenses'}
Focus specifically on creating high-converting viral hooks for travellers visiting ${targetTownsStr}.

Output strictly valid JSON with this exact schema:
{
  "title": "Short catchy title",
  "hook": "Attention-grabbing opening line",
  "caption": "Full high-converting caption with spacing and emojis",
  "callToAction": "Clear booking CTA with link mention",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API request timed out')), 7000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text);
        return res.json({
          title: parsed.title,
          hook: parsed.hook,
          caption: parsed.caption,
          callToAction: parsed.callToAction,
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#RideOutZambales', '#MotoRentalPH'],
        });
      } catch (jsonErr) {
        console.error('Failed to parse Gemini JSON output:', jsonErr);
        return res.status(500).json({ error: 'Invalid JSON returned by Gemini' });
      }
    }

    return res.status(200).json({ 
      fallback: true, 
      message: 'Empty response returned by Gemini, defaulting to template.' 
    });
  } catch (error: any) {
    console.error('Server Gemini generation error:', error?.message || error);
    return res.status(200).json({ 
      fallback: true, 
      error: error?.message || 'Gemini generation failed, using curated template' 
    });
  }
});

// Server-side AI-Assisted Omnichannel Response Dispatcher
app.post('/api/inbox/ai-reply', async (req, res) => {
  try {
    const {
      platform = 'messenger',
      customerName = 'Customer',
      inquiryTopic = '',
      bikeModel = 'Yamaha NMAX 155 ABS',
      dailyRate = 900,
      rentalDays = 3,
      smartPricingDetails = '',
      tone = 'Warm & Hospitable',
      intentPrompt = '',
      conversationHistory = []
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured. Utilizing client-side AI response generator.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const formattedHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-5).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')
      : '';

    const systemPrompt = `You are an AI customer response assistant for "RideOut Zambales Moto Rental", located at San Felipe HQ, Zambales, Philippines (near Liwliwa Beach, Crystal Beach, and Botolan).
You are drafting an immediate, polite, natural response to a customer on ${platform.toUpperCase()}.
Customer: ${customerName}
Topic: ${inquiryTopic}
Inquired Bike: ${bikeModel} (Standard rate: ₱${dailyRate}/day for ${rentalDays} days)
Smart Dynamic Pricing Status: ${smartPricingDetails || 'Standard rates apply'}
Requested Tone: ${tone}
Specific Instructions / Focus: ${intentPrompt || 'Provide an accurate quote, explain reservation steps, and guide them warmly.'}

Conversation context:
${formattedHistory}

Rules for the response:
1. Speak in a warm, welcoming, local Philippine hospitality style (English with natural conversational warmth or friendly Taglish if requested).
2. For WhatsApp and Messenger, use clear bullet points and line breaks.
3. For Instagram and TikTok DMs, keep it snappy and punchy with 1-2 relevant emojis (🛵 🌊 🌴).
4. If quoting pricing, mention the smart pricing duration discount and flash utilization promo if active.
5. If mentioning deposit, note our flexible deposit options: either ₱2,000 security deposit OR physical government ID held by depot staff with a transparent custody photo.
6. Provide a clear call to action to confirm the reservation.

Output strictly valid JSON with this format:
{
  "replyText": "The complete message ready to send to the customer",
  "keyHighlights": ["Highlight 1", "Highlight 2"],
  "suggestedFollowUp": "Optional short follow-up or check-in suggestion"
}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI reply generation timed out')), 8000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text);
        return res.json({
          replyText: parsed.replyText,
          keyHighlights: parsed.keyHighlights || [],
          suggestedFollowUp: parsed.suggestedFollowUp || ''
        });
      } catch (jsonErr) {
        console.error('Failed to parse AI reply JSON:', jsonErr);
        return res.status(200).json({
          replyText: response.text.trim(),
          keyHighlights: ['Instant Quote Generated'],
          suggestedFollowUp: ''
        });
      }
    }

    return res.status(200).json({
      fallback: true,
      message: 'Empty response returned from model',
    });
  } catch (error: any) {
    console.error('AI reply error:', error?.message || error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'AI reply service unavailable',
    });
  }
});

// Server-side Streaming generation route (SSE)
app.post('/api/social/generate-stream', async (req, res) => {
  try {
    const { platform, topic, tone, bikeModel } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.write(`data: ${JSON.stringify({ fallback: true, error: 'No GEMINI_API_KEY configured' })}\n\n`);
      res.end();
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Write a captivating viral post for ${platform} for RideOut Zambales Moto Rental regarding ${topic} with a ${tone} tone. Featured bike: ${bikeModel}. Include emojis and hashtags.`;

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Server streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
    res.end();
  }
});

// Serve frontend with Vite middlewares in dev, or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const vite = await createViteServer({
    server: { 
      middlewareMode: true, 
      hmr: isHmrDisabled ? false : { server: httpServer },
      watch: isHmrDisabled ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Rideout Rentals server running on http://0.0.0.0:${port} (mode: ${isProduction ? 'production' : 'development'})`);
});
