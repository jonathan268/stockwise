const mongoose = require('mongoose');

/**
 * Vérifier si une valeur est un ObjectId MongoDB valide
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Valider email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider numéro de téléphone camerounais
 */
const isValidCameroonPhone = (phone) => {
  // Format: +237 6XX XX XX XX ou 6XX XX XX XX
  const phoneRegex = /^(\+237)?6[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valider SKU (lettres, chiffres, tirets)
 */
const isValidSKU = (sku) => {
  const skuRegex = /^[A-Z0-9-]+$/;
  return skuRegex.test(sku);
};

/**
 * Valider prix (nombre positif avec max 2 décimales)
 */
const isValidPrice = (price) => {
  return typeof price === 'number' && 
         price >= 0 && 
         /^\d+(\.\d{1,2})?$/.test(price.toString());
};

/**
 * Valider quantité (nombre entier positif)
 */
const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0;
};

/**
 * Nettoyer et normaliser chaîne
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/\s+/g, ' ') // Remplacer espaces multiples par un seul
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Retirer scripts
    .replace(/<[^>]+>/g, ''); // Retirer HTML
};

/**
 * Valider plage de dates
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !isNaN(start.getTime()) && 
         !isNaN(end.getTime()) && 
         start <= end;
};

/**
 * Générer slug à partir d'un texte
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Formater prix en FCFA
 */
const formatPrice = (price, currency = 'XAF') => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
  
  return formatted;
};

/**
 * Calculer pourcentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(2));
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidCameroonPhone,
  isValidSKU,
  isValidPrice,
  isValidQuantity,
  sanitizeString,
  isValidDateRange,
  generateSlug,
  formatPrice,
  calculatePercentage
};