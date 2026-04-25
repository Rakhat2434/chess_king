import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import News from '@/models/News';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, jsonError, parsePagination } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = parsePagination(searchParams, { defaultLimit: 20 });

  const [items, total] = await Promise.all([
    News.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name').lean(),
    News.countDocuments(),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    const { title, content, excerpt, coverImage, isPublished } = body;

    if (typeof title !== 'string' || typeof content !== 'string' || !title.trim() || !content.trim()) {
      return jsonError('Заголовок и содержимое обязательны');
    }

    if (excerpt && String(excerpt).length > 400) {
      return jsonError('Краткое описание не должно быть длиннее 400 символов');
    }

    const baseSlug = createSlug(title) || `news-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await News.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const news = await News.create({
      title: title.trim(),
      slug,
      excerpt: typeof excerpt === 'string' && excerpt.trim() ? excerpt.trim() : content.slice(0, 160).trim(),
      content: content.trim(),
      coverImage: typeof coverImage === 'string' && coverImage.trim() ? coverImage.trim() : undefined,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : undefined,
      createdBy: session!.user.id,
    });

    return NextResponse.json(news, { status: 201 });
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}
