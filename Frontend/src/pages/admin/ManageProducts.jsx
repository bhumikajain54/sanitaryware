import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useState } from 'react';

const ManageProducts = () => {
  const { products, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate products by ID
  const deduplicatedProducts = Array.from(new Map(products.map(item => [item.id, item])).values());

  const filteredProducts = deduplicatedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-dark mb-2">
              Manage Products
            </h1>
            <p className="text-gray-600">View, edit, and delete products</p>
          </div>
          <Link to="/admin/products/add" className="btn-primary">
            + Add New Product
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Brand
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-semibold text-dark">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{product.brand}</td>
                    <td className="py-4 px-6">{product.category}</td>
                    <td className="py-4 px-6 font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
