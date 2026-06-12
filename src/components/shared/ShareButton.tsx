'use client';

import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, getShareUrl } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface Props {
  url: string;
  className?: string;
  showLabel?: boolean;
}

export default function ShareButton({ url, className, showLabel }: Props) {
  const { t } = useTranslation();

  const handleShare = async () => {
    const fullUrl = getShareUrl(url);
    if (navigator.share) {
      try {
        await navigator.share({ url: fullUrl, title: document.title });
      } catch {}
    } else {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(t('common.copied'));
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn('transition-colors', className)}
      aria-label={t('common.share')}
    >
      <Share2 className="w-4 h-4" />
      {showLabel && <span>{t('common.share')}</span>}
    </button>
  );
}
