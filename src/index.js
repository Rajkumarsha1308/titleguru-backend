import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.post('/api/generate/title', async (req, res) => {
  const { keyword, count_titles = 5, tone = 'catchy' } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword required' });

  try {
    const prompt = \`Give \${count_titles} SEO-optimized YouTube titles in Tamil for the keyword "\${keyword}". Tone: \${tone}. Include tags and hashtags.\`;
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
    console.error(err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.listen(port, () => {
  console.log(\`TitleGuru backend running on http://localhost:\${port}\`);
});