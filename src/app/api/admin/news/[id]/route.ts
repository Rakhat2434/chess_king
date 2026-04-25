import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import News from '@/models/News';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id новости', 400);

  try {
    await connectDB();
    const existing = await News.findById(params.id);
    if (!existing) return jsonError('Не найдено', 404);

    const body = await req.json();
    const { title, content, excerpt, coverImage, isPublished } = body;

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return jsonError('Заголовок обязателен');
    }
    if (content !== undefined && (typeof content !== 'string' || !content.trim())) {
      return jsonError('Содержимое обязательно');
    }
    if (excerpt !== undefined && String(excerpt).length > 400) {
      return jsonError('Краткое описание не должно быть длиннее 400 символов');
    }

    const update: Record<string, unknown> = {
      updatedBy: session!.user.id,
    };
    const unset: Record<string, ''> = {};

    if (typeof title === 'string') {
      const nextTitle = title.trim();
      update.title = nextTitle;
      if (nextTitle !== existing.title) {
        const baseSlug = createSlug(nextTitle) || `news-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 2;
        while (await News.exists({ slug, _id: { $ne: params.id } })) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        update.slug = slug;
      }
    }
    if (typeof content === 'string') update.content = content.trim();
    if (typeof excerpt === 'string') update.excerpt = excerpt.trim() || existing.excerpt;
    if (typeof coverImage === 'string') {
      const nextCoverImage = coverImage.trim();
      if (nextCoverImage) update.coverImage = nextCoverImage;
      else unset.coverImage = '';
    }
    if (typeof isPublished === 'boolean') {
      update.isPublished = isPublished;
      if (isPublished && !existing.publishedAt) update.publishedAt = new Date();
    }

    const news = await News.findByIdAndUpdate(params.id, {
      $set: update,
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(news);
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id новости', 400);

  await connectDB();
  const news = await News.findByIdAndDelete(params.id);
  if (!news) return jsonError('Не найдено', 404);
  return NextResponse.json({ success: true });
}
