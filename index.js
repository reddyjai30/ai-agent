import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import { fetch, Headers, Request, Response } from 'undici';
import { Blob } from 'fetch-blob';
import { FormData } from 'formdata-node';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

dotenv.config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post('/parse-intent', async (req, res) => {
  const userMessage = req.body.message;
  console.log("User said:", userMessage);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Web3 assistant. The user may speak informally. Convert their intent into a JSON array with ONLY the following keys: action, token, amount, to (for transfer). Examples of actions: "stake", "transfer", "buy", "sell". Respond ONLY with valid JSON. Do not explain. If any field is unclear, leave it null. Example response: [{ action: "stake", token: "BDAG", amount: 1 }]'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.2
    });

    const rawContent = response.choices[0].message.content;
    console.log("Raw OpenAI content:", rawContent);

    const parsed = JSON.parse(rawContent);
    console.log("AI Response:", parsed);

    res.json({ intents: parsed });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).send('Something went wrong');
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`AI Agent listening on http://localhost:${PORT}`);
});