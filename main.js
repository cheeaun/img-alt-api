import { load } from 'https://deno.land/std/dotenv/mod.ts';
import { encodeBase64 } from 'https://deno.land/std/encoding/base64.ts';
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { cors } from 'https://deno.land/x/hono/middleware.ts';
import OpenAI from 'npm:openai';
const env = await load();

// Inspired by Ice Cubes
// https://github.com/Dimillian/IceCubesApp/blob/5f052485236027c624bbcc3e7e3d5b043e05036e/Packages/Network/Sources/Network/OpenAIClient.swift#L81
const PROMPT = `What’s in this image? Be brief, it's for image alt description on a social network. Don't write in the first person.`;
const MAX_TOKENS = 85;
const UPLOAD_LIMIT =
  Deno.env.get('UPLOAD_LIMIT') || env.UPLOAD_LIMIT || 10 * 1024 * 1024; // 10MB
const API_KEY = Deno.env.get('OPENAI_API_KEY') || env.OPENAI_API_KEY;
const MODEL = Deno.env.get('OPENAI_MODEL') || env.OPENAI_MODEL || 'gpt-4.1-nano';

const openai = new OpenAI({ apiKey: API_KEY });
function requestVision(image_url, { lang } = {}) {
  // lang = language code e.g. 'en'
  const input = [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: PROMPT,
        },
        {
          type: 'input_image',
          image_url,
        },
      ],
    },
  ];
  if (lang) {
    input.push({
      role: 'system',
      content: `Answer only in this language (code): "${lang}"`,
    });
  }
  return openai.responses.create({
    model: MODEL,
    input,
    max_output_tokens: MAX_TOKENS,
  });
}

const app = new Hono();

app.use(
  '*',
  cors({
    allowMethods: ['GET', 'POST'],
  }),
);

app.get('/', async (c) => {
  const image = c.req.query('image');
  const lang = c.req.query('lang');
  if (/https?:\/\//.test(image)) {
    let response;
    try {
      response = await requestVision(image, {
        lang,
      });
    } catch (error) {
      return c.json({ error: error?.message || error }, 500);
    }
    const description = response?.output_text;
    if (!description) {
      return c.json({ error: 'Failed to generate description' }, 500);
    }
    return c.json({ description });
  }

  return c.json({
    name: 'img-alt-api',
    model: MODEL,
  });
});

// Image upload endpoint
app.post('/', async (c) => {
  const lang = c.req.query('lang');
  const { image } = await c.req.parseBody(); // File

  if (!image) {
    return c.json({ error: 'No image provided' }, 400);
  }
  if (!/^image\/(png|jpeg|webp|gif)$/.test(image.type)) {
    return c.json({ error: 'Invalid image type' }, 400);
  }
  if (image.size > UPLOAD_LIMIT) {
    return c.json({ error: 'Image size too large' }, 400);
  }

  const arrayBufferImage = await image.arrayBuffer();
  const base64Image = encodeBase64(arrayBufferImage);

  // Request to OpenAI
  let response;
  try {
    response = await requestVision(`data:${image.type};base64,${base64Image}`, {
      lang,
    });
  } catch (error) {
    return c.json({ error: error?.message || error }, 500);
  }

  const description = response?.choices?.[0]?.message?.content;

  if (!description) {
    return c.json({ error: 'Failed to generate description' }, 500);
  }

  return c.json({ description });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

Deno.serve(app.fetch);
