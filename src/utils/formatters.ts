export const formatRupiah = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `- ${formatted}` : formatted;
};

export const formatShortRupiah = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  let result = '';

  if (absAmount >= 1_000_000) {
    result = `Rp ${(absAmount / 1_000_000).toFixed(1)}jt`;
  } else if (absAmount >= 1_000) {
    result = `Rp ${(absAmount / 1_000).toFixed(0)}k`;
  } else {
    result = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absAmount);
  }

  return isNegative ? `-${result}` : result;
};

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatTime = (isoStr: string): string => {
  try {
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const normalizePhoneForWhatsApp = (phone?: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const createWhatsAppReminderUrl = (
  phone: string | undefined,
  playerName: string,
  sessionDate: string,
  venue: string,
  amount: number
): string => {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  const formattedFee = formatRupiah(amount);
  const message = `Halo ${playerName} 👋, terima kasih sudah join main bareng di ${venue} pada tanggal ${formatDate(sessionDate)}. Mengingatkan untuk iuran kas/lapangan sebesar *${formattedFee}*. Pembayaran bisa ditransfer/cash ya. Salam smash! 🏸`;
  
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
