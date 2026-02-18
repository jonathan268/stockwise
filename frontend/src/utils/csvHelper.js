/**
 * Exporter les produits en CSV
 */
export const exportToCSV = (products, filename = 'produits.csv') => {
  // Définir les en-têtes
  const headers = [
    'Nom',
    'SKU',
    'Description',
    'Catégorie',
    'Unité',
    'Quantité',
    'Seuil Min',
    'Seuil Max',
    'Prix Achat',
    'Prix Vente',
    'Marge (%)',
    'Valeur Stock',
    'Périssable',
    'Durée Conservation',
    'Saisonnier',
    'Statut'
  ];

  // Convertir les produits en lignes CSV
  const rows = products.map(product => {
    const quantity = product.stock?.quantity || 0;
    const cost = product.pricing?.cost || 0;
    const sellingPrice = product.pricing?.sellingPrice || 0;
    const margin = cost > 0 ? (((sellingPrice - cost) / cost) * 100).toFixed(2) : 0;
    const stockValue = quantity * sellingPrice;

    return [
      `"${product.name || ''}"`,
      `"${product.sku || ''}"`,
      `"${(product.description || '').replace(/"/g, '""')}"`,
      `"${product.category?.name || ''}"`,
      product.unit || '',
      quantity,
      product.stock?.minThreshold || 0,
      product.stock?.maxThreshold || 0,
      cost,
      sellingPrice,
      margin,
      stockValue,
      product.metadata?.perishable ? 'Oui' : 'Non',
      product.metadata?.shelfLife || '',
      product.metadata?.seasonal ? 'Oui' : 'Non',
      getStatusText(product)
    ].join(',');
  });

  // Combiner headers et rows
  const csv = [headers.join(','), ...rows].join('\n');

  // Créer le blob et télécharger
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parser un fichier CSV
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('Fichier CSV vide'));
          return;
        }

        // Parser les headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Parser les lignes
        const products = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          
          if (values.length !== headers.length) {
            continue; // Skip malformed lines
          }

          const product = {
            name: values[0],
            sku: values[1] || undefined,
            description: values[2] || undefined,
            category: values[3], // Sera résolu par nom
            unit: values[4] || 'piece',
            stock: {
              quantity: parseFloat(values[5]) || 0,
              minThreshold: parseFloat(values[6]) || 0,
              maxThreshold: parseFloat(values[7]) || 0,
              location: 'Principal'
            },
            pricing: {
              cost: parseFloat(values[8]) || 0,
              sellingPrice: parseFloat(values[9]) || 0,
              currency: 'XAF',
              taxRate: 0
            },
            metadata: {
              perishable: values[12]?.toLowerCase() === 'oui',
              shelfLife: parseInt(values[13]) || undefined,
              seasonal: values[14]?.toLowerCase() === 'oui'
            }
          };

          products.push(product);
        }

        resolve(products);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erreur lecture fichier'));
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Parser une ligne CSV (gère les guillemets)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Helper pour obtenir le texte du statut
 */
function getStatusText(product) {
  const stock = product.stock;
  
  if (!stock) return 'Non défini';

  const quantity = stock.quantity || 0;
  const minThreshold = stock.minThreshold || 0;

  if (quantity === 0) {
    return 'Rupture';
  } else if (quantity <= minThreshold / 2) {
    return 'Critique';
  } else if (quantity <= minThreshold) {
    return 'Stock bas';
  } else {
    return 'En stock';
  }
}

/**
 * Modèle CSV pour téléchargement
 */
export const downloadCSVTemplate = () => {
  const headers = [
    'Nom',
    'SKU',
    'Description',
    'Catégorie',
    'Unité',
    'Quantité',
    'Seuil Min',
    'Seuil Max',
    'Prix Achat',
    'Prix Vente',
    'Marge (%)',
    'Valeur Stock',
    'Périssable',
    'Durée Conservation',
    'Saisonnier',
    'Statut'
  ];

  const exampleRow = [
    '"Riz parfumé 25kg"',
    '"RIZ-25KG"',
    '"Riz de qualité supérieure"',
    '"Céréales"',
    'bag',
    '50',
    '10',
    '100',
    '12000',
    '15000',
    '25',
    '750000',
    'Non',
    '',
    'Non',
    'En stock'
  ];

  const csv = [headers.join(','), exampleRow.join(',')].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'modele-import-produits.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};