import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export function getErrorMessage(error: unknown, fallback = 'Ошибка сервера') {
  return error instanceof Error ? error.message : fallback;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function isValidObjectId(id: string | undefined | null): id is string {
  return Boolean(id && mongoose.Types.ObjectId.isValid(id));
}

export function parsePagination(
  searchParams: URLSearchParams,
  options: { defaultLimit?: number; maxLimit?: number } = {}
) {
  const defaultLimit = options.defaultLimit ?? 20;
  const maxLimit = options.maxLimit ?? 100;
  const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);
  const limitParam = Number.parseInt(searchParams.get('limit') || String(defaultLimit), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, maxLimit)
      : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
