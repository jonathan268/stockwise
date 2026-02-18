import React, { useRef, useState } from 'react';
import { Download, Upload, FileDown, Loader2 } from 'lucide-react';
import { exportToCSV, parseCSV, downloadCSVTemplate } from '../../../utils/csvHelper';
import { ProductService } from '../../../services/productService';
import { CategoryService } from '../../../services/categoryService';
import toast from 'react-hot-toast';

const ImportExportButtons = ({ products, onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  // ==================== EXPORT ====================
  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      exportToCSV(products, `produits-${timestamp}.csv`);
      toast.success(`${products.length} produits exportés avec succès`);
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  // ==================== DOWNLOAD TEMPLATE ====================
  const handleDownloadTemplate = () => {
    try {
      downloadCSVTemplate();
      toast.success('Modèle téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement modèle:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  // ==================== IMPORT ====================
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier l'extension
    if (!file.name.endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    setImporting(true);
    const loadingToast = toast.loading('Import en cours...');

    try {
      // Parser le CSV
      const parsedProducts = await parseCSV(file);
      
      if (parsedProducts.length === 0) {
        toast.error('Aucun produit valide trouvé dans le fichier', { id: loadingToast });
        return;
      }

      // Charger les catégories existantes pour résolution
      const categoriesResponse = await CategoryService.getAllCategories();
      const categories = categoriesResponse.data || [];
      
      // Créer un map des catégories par nom
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat._id;
      });

      // Résoudre les catégories et importer
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const product of parsedProducts) {
        try {
          // Résoudre la catégorie
          const categoryName = product.category?.toLowerCase();
          const categoryId = categoryMap[categoryName];

          if (!categoryId) {
            errors.push(`${product.name}: Catégorie "${product.category}" introuvable`);
            errorCount++;
            continue;
          }

          // Remplacer le nom de catégorie par l'ID
          product.category = categoryId;

          // Créer le produit
          await ProductService.addProduct(product);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`${product.name}: ${error.response?.data?.message || error.message}`);
        }
      }

      // Afficher le résultat
      if (successCount > 0) {
        toast.success(
          `${successCount} produit(s) importé(s) avec succès`,
          { id: loadingToast }
        );
        onImportSuccess();
      }

      if (errorCount > 0) {
        toast.error(
          `${errorCount} erreur(s) lors de l'import. Consultez la console pour plus de détails.`,
          { id: loadingToast, duration: 6000 }
        );
        console.error('Erreurs d\'import:', errors);
      }

    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import du fichier', { id: loadingToast });
    } finally {
      setImporting(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost gap-2">
        <Download size={20} />
        Import/Export
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2">
        <li>
          <button onClick={handleExport} disabled={products.length === 0}>
            <Download size={18} />
            Exporter (CSV)
          </button>
        </li>
        <li>
          <button onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload size={18} />
                Importer (CSV)
              </>
            )}
          </button>
        </li>
        <li>
          <button onClick={handleDownloadTemplate}>
            <FileDown size={18} />
            Télécharger modèle
          </button>
        </li>
      </ul>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
};

export default ImportExportButtons;