import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isLanguage, type Language } from '@/lib/i18n';
import connectDB from '@/lib/db';
import TranslationCache from '@/models/TranslationCache';

const MAX_ITEMS = 20;
const MAX_TEXT_LENGTH = 5000;
const SOURCE_LANGUAGE: Language = 'ru';
const TRANSLATION_PROVIDER = 'openai';

type TranslationItem = {
  text: string;
  index: number;
  key: string;
  sourceHash: string;
};

type CachedTranslation = {
  key: string;
  translatedText: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texts = Array.isArray(body.texts)
      ? body.texts.map((item: unknown) => (typeof item === 'string' ? item : ''))
      : [];
    const targetLanguage = isLanguage(body.targetLanguage) ? body.targetLanguage : 'kz';

    if (targetLanguage === 'ru') {
      return NextResponse.json({ translations: texts });
    }

    if (targetLanguage !== 'kz') {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const trimmedTexts = texts.map((text: string) => text.trim());
    if (!trimmedTexts.length || trimmedTexts.length > MAX_ITEMS) {
      return NextResponse.json({ error: 'Invalid translation request' }, { status: 400 });
    }

    if (trimmedTexts.some((text: string) => !text || text.length > MAX_TEXT_LENGTH)) {
      return NextResponse.json({ error: 'Text is empty or too long' }, { status: 400 });
    }

    const translations = await translateTexts(trimmedTexts, targetLanguage);
    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function translateTexts(texts: string[], targetLanguage: Language) {
  await connectDB();

  const translations = new Array<string>(texts.length);
  const items = texts.map((text, index) => createTranslationItem(text, targetLanguage, index));
  const keys = [...new Set(items.map((item) => item.key))];
  const translatedByKey = new Map<string, string>();

  const cachedDocs = await TranslationCache.find({ key: { $in: keys } })
    .select('key translatedText')
    .lean<CachedTranslation[]>();

  cachedDocs.forEach((doc) => {
    translatedByKey.set(doc.key, doc.translatedText);
  });

  items.forEach((item) => {
    const cached = translatedByKey.get(item.key);
    if (cached) {
      translations[item.index] = cached;
    }
  });

  const missing = getUniqueMissingItems(items, translatedByKey);

  if (missing.length) {
    const model = getTranslationModel();
    const translated = await requestOpenAITranslation(missing.map((item) => item.text), model);
    const now = new Date();

    const writes = missing.map((item, localIndex) => {
      const nextValue = translated[localIndex] || item.text;
      translatedByKey.set(item.key, nextValue);

      return {
        updateOne: {
          filter: { key: item.key },
          update: {
            $set: {
              sourceLanguage: SOURCE_LANGUAGE,
              targetLanguage,
              sourceHash: item.sourceHash,
              sourceText: item.text,
              translatedText: nextValue,
              provider: TRANSLATION_PROVIDER,
              providerModel: model,
              lastUsedAt: now,
            },
            $inc: { usageCount: 1 },
          },
          upsert: true,
        },
      };
    });

    await TranslationCache.bulkWrite(writes, { ordered: false });

    items.forEach((item) => {
      translations[item.index] = translatedByKey.get(item.key) || item.text;
    });
  } else if (keys.length) {
    await TranslationCache.updateMany(
      { key: { $in: keys } },
      { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } }
    );
  }

  return translations;
}

function createTranslationItem(text: string, targetLanguage: Language, index: number): TranslationItem {
  const sourceHash = getSourceHash(text);
  return {
    text,
    index,
    sourceHash,
    key: getCacheKey(sourceHash, targetLanguage),
  };
}

function getUniqueMissingItems(items: TranslationItem[], translatedByKey: Map<string, string>) {
  const missing = new Map<string, TranslationItem>();

  items.forEach((item) => {
    if (!translatedByKey.has(item.key)) {
      missing.set(item.key, item);
    }
  });

  return [...missing.values()];
}

async function requestOpenAITranslation(texts: string[], model: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions:
        'Translate user-facing website text from Russian to Kazakh. Use natural literary Kazakh, keep names, URLs, phone numbers, dates and brand names unchanged. Return only a valid JSON array of strings in the same order.',
      input: JSON.stringify({ targetLanguage: 'Kazakh', texts }),
      temperature: 0.2,
      max_output_tokens: Math.min(12000, Math.max(1200, texts.join('\n').length * 2)),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI translation failed: ${errorText}`);
  }

  const data = await response.json();
  const rawText = extractResponseText(data);
  const parsed = parseJsonArray(rawText);

  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error('OpenAI returned an invalid translation payload');
  }

  return parsed.map((item, index) => (typeof item === 'string' ? item : texts[index]));
}

function getTranslationModel() {
  return process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1';
}

function extractResponseText(data: any) {
  if (typeof data.output_text === 'string') return data.output_text;

  const chunks: string[] = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function parseJsonArray(value: string) {
  const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

function getSourceHash(text: string) {
  return createHash('sha256').update(text).digest('hex');
}

function getCacheKey(sourceHash: string, targetLanguage: Language) {
  return `${SOURCE_LANGUAGE}:${targetLanguage}:${sourceHash}`;
}
