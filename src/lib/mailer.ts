import nodemailer from 'nodemailer';
import { formatDate } from './utils';

export type TournamentStatusEmailStatus = 'approved' | 'rejected' | 'attended' | 'cancelled';

type TournamentStatusEmailInput = {
  to: string;
  userName: string;
  tournamentTitle: string;
  tournamentDate: Date | string;
  status: TournamentStatusEmailStatus;
  adminNote?: string;
  tournamentUrl?: string;
};

const statusLabels: Record<TournamentStatusEmailStatus, string> = {
  approved: 'Участие подтверждено',
  rejected: 'Заявка отклонена',
  attended: 'Участие отмечено',
  cancelled: 'Участие отменено',
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) return null;

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: SMTP_FROM,
  };
}

export async function sendTournamentStatusEmail(input: TournamentStatusEmailInput) {
  const smtp = getSmtpConfig();
  if (!smtp || !Number.isFinite(smtp.port)) {
    return { sent: false, warning: 'SMTP не настроен' };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.auth,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://chessking.kz';
  const safeName = escapeHtml(input.userName || 'Игрок');
  const safeTitle = escapeHtml(input.tournamentTitle);
  const safeStatus = escapeHtml(statusLabels[input.status]);
  const safeNote = input.adminNote?.trim() ? escapeHtml(input.adminNote.trim()) : '';
  const link = input.tournamentUrl || siteUrl;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#17213c">
      <div style="background:#101a36;border-radius:18px;padding:24px;color:#fff">
        <p style="margin:0 0 6px;color:#d9aa42;font-weight:700;letter-spacing:.08em;text-transform:uppercase">ChessKing</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25">Статус вашей заявки обновлен</h1>
      </div>
      <div style="padding:24px 0">
        <p style="font-size:16px">Здравствуйте, <strong>${safeName}</strong>!</p>
        <p style="font-size:15px;line-height:1.6">Статус вашей заявки на турнир обновлен.</p>
        <div style="background:#f6f7fb;border-radius:14px;padding:18px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Турнир:</strong> ${safeTitle}</p>
          <p style="margin:0 0 8px"><strong>Дата:</strong> ${formatDate(input.tournamentDate)}</p>
          <p style="margin:0"><strong>Новый статус:</strong> ${safeStatus}</p>
          ${safeNote ? `<p style="margin:12px 0 0"><strong>Комментарий администратора:</strong> ${safeNote}</p>` : ''}
        </div>
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700">Открыть сайт</a>
      </div>
      <p style="font-size:12px;color:#6b7280">Это автоматическое письмо ChessKing Academy.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: input.to,
    subject: 'Статус вашей заявки на турнир ChessKing обновлен',
    html,
    text: [
      `Здравствуйте, ${input.userName}!`,
      `Турнир: ${input.tournamentTitle}`,
      `Дата: ${formatDate(input.tournamentDate)}`,
      `Новый статус: ${statusLabels[input.status]}`,
      input.adminNote ? `Комментарий администратора: ${input.adminNote}` : '',
      `Сайт: ${link}`,
    ].filter(Boolean).join('\n'),
  });

  return { sent: true, warning: null };
}
