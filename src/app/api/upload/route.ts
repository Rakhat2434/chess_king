import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { getErrorMessage, jsonError } from '@/lib/api';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
  ['image/webp', ['webp']],
]);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getFileExtension(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  return extension && extension !== fileName.toLowerCase() ? extension : '';
}

function normalizeCloudinaryFolder(folder: string): string {
  const parts = folder
    .replace(/\\/g, '/')
    .split('/')
    .filter((part) => /^[a-zA-Z0-9_-]+$/.test(part));

  if (parts[0] !== 'chessking') {
    parts.unshift('chessking');
  }

  return parts.join('/') || 'chessking';
}

function hasValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    );
  }

  return false;
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'chessking';

    if (!(file instanceof File)) return jsonError('Файл не найден');
    if (file.size > MAX_UPLOAD_SIZE) return jsonError('Файл не должен быть больше 5 МБ');

    const allowedExtensions = ALLOWED_IMAGE_TYPES.get(file.type);
    const extension = getFileExtension(file.name);

    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      return jsonError('Можно загружать только JPG, PNG или WebP изображения');
    }

    const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return jsonError('Cloudinary не настроен', 500);
    }

    const safeFolder = normalizeCloudinaryFolder(folder);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!hasValidImageSignature(buffer, file.type)) {
      return jsonError('Файл не похож на допустимое изображение');
    }

    const uploadOptions: UploadApiOptions = {
      folder: safeFolder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      overwrite: false,
      use_filename: false,
      unique_filename: true,
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
    };

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
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
