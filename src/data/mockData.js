// Initial Seed Data for IISER Mohali Campus Marketplace

export const INITIAL_BANNED_KEYWORDS = [
  'exam paper', 'leak', 'weed', 'alcohol', 'drugs', 'weapon',
  'knife', 'cheat', 'vape', 'tobacco', 'stolen'
];

export const CATEGORIES = [
  'All',
  'Stationery',
  'Grocery',
  'Electronics',
  'Ready to Eat',
  'Clothes',
  'Utilities',
  'Supplements',
  'Textbooks',
  'Miscellaneous'
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Heavily Used'];

export const ADMIN_EMAILS = [
  'ms25237@iisermohali.ac.in',
  'admin@marketplace.org'
];

export const isUserAdmin = (email) => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.includes('admin') || ADMIN_EMAILS.includes(clean);
};

export const INITIAL_LISTINGS = [];

export const DEFAULT_ADMIN_SUPPORT_WHATSAPP = '+917988860162';

