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

app.post('/api/generate', async (req, res) => {
  try {
    const { messages, model = 'gpt-4.1-mini', temperature = 0.5 } = req.body || {};
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages[] is required' });

    const resp = await openai.chat.completions.create({ model, messages, temperature });
    const content = resp?.choices?.[0]?.message?.content ?? '';
    res.json({ content, raw: resp });
  } catch (err) {
    console.error('AI generation failed:', err);
    const status = err?.status || 500;
    const details = err?.response?.data || err?.message || err;
    res.status(status).json({ error: 'OpenAI error', details });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
