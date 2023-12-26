import { load } from 'https://deno.land/std/dotenv/mod.ts';
import { encodeBase64 } from 'https://deno.land/std/encoding/base64.ts';
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { cors } from 'https://deno.land/x/hono/middleware.ts';
import OpenAI from 'npm:openai';
const env = await load();

// Inspired by Ice Cubes
// https://github.com/Dimillian/IceCubesApp/blob/5f052485236027c624bbcc3e7e3d5b043e05036e/Packages/Network/Sources/Network/OpenAIClient.swift#L81
const PROMPT = `What’s in this image? Be brief, it's for image alt description on a social network. Don't write in the first person.`;
const MAX_TOKENS = 50;
const UPLOAD_LIMIT =
  Deno.env.get('UPLOAD_LIMIT') || env.UPLOAD_LIMIT || 10 * 1024 * 1024; // 10MB
const API_KEY = Deno.env.get('OPENAI_API_KEY') || env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: API_KEY });
function requestVision(image_url) {
  return openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: PROMPT,
          },
          {
            type: 'image_url',
            image_url,
          },
        ],
      },
    ],
    max_tokens: MAX_TOKENS,
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
  if (/https?:\/\//.test(image)) {
    let response;
    try {
      response = await requestVision(image);
    } catch (error) {
      return c.json({ error: error?.message || error }, 500);
    }
    const description = response?.choices?.[0]?.message?.content;
    if (!description) {
      return c.json({ error: 'Failed to generate description' }, 500);
    }
    return c.json({ description });
  }

  return c.json({
    name: 'img-alt-api',
  });
});

// Image upload endpoint
app.post('/', async (c) => {
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
  const response = await requestVision(
    `data:${image.type};base64,${base64Image}`,
  );

  const description = response?.choices?.[0]?.message?.content;

  if (!description) {
    return c.json({ error: 'Failed to generate description' }, 500);
  }

  return c.json({ description });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

Deno.serve(app.fetch);
