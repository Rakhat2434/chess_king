import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { getErrorMessage, jsonError } from '@/lib/api';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'chessking';

    if (!(file instanceof File)) return jsonError('Файл не найден');
    if (!file.type.startsWith('image/')) return jsonError('Можно загружать только изображения');
    if (file.size > 5 * 1024 * 1024) return jsonError('Файл не должен быть больше 5 МБ');

    const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return jsonError('Cloudinary не настроен', 500);
    }

    const safeFolder = folder
      .replace(/\\/g, '/')
      .split('/')
      .filter((part) => /^[a-zA-Z0-9_-]+$/.test(part))
      .join('/') || 'chessking';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: safeFolder, resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Cloudinary did not return upload result'));
        })
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: unknown) {
    console.error('Upload error:', err);
    return jsonError(getErrorMessage(err, 'Ошибка загрузки файла'), 500);
  }
}
