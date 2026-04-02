import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/axios";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/products");
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Produits
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Nouveau produit
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
          <Filter className="w-5 h-5" />
          Filtres
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Nom
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  SKU
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Prix
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Stock
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">{product.sku}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 font-semibold">{product.price}€</td>
                  <td className="px-6 py-4">{product.quantity}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700">
                      Éditer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
