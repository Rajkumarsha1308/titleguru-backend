// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '1mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/generate/title', async (req, res) => {
  const { keyword, count_titles = 5, tone = 'catchy' } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword required' });

  try {
    const prompt = `Give ${count_titles} SEO-optimized YouTube titles in Tamil for the keyword "${keyword}". Tone: ${tone}. Include tags and hashtags.`;

    const response = await openai.createChatCompletion({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a Tamil YouTube title generator.' },
        { role: 'user', content: prompt },
      ],
    });

    const text = response.data.choices[0].message.content;

    await prisma.generation.create({
      data: { keyword, response: text },
    });

    res.json({ output: text });
  } catch (err) {
    console.error('OpenAI Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});
