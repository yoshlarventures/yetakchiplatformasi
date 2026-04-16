/**
 * Raqamni formatlash - har 3 raqamda bo'sh joy qo'yish
 * Masalan: 100000000 -> "100 000 000 so'm"
 */
export const formatMoney = (value: number | undefined | null): string => {
  if (!value || value === 0) return '-';

  // Raqamni stringga aylantirish va har 3 raqamda bo'sh joy qo'yish
  const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${formatted} so'm`;
};

/**
 * Faqat raqamni formatlash (so'm qo'shmasdan)
 */
export const formatNumber = (value: number | undefined | null): string => {
  if (!value || value === 0) return '-';

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
