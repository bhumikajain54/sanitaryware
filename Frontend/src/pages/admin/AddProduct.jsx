import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import adminService from '../../services/adminService';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '0',
    image: '',
    description: '',
    features: '',
    inStock: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          adminService.getBrands(),
          adminService.getCategories()
        ]);
        setBrands(brandsData || []);
        setCategories(categoriesData || []);
        // Set default values once data is loaded
        if (brandsData && brandsData.length > 0) {
          setFormData(prev => ({ ...prev, brand: brandsData[0].name }));
        }
        if (categoriesData && categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
        }
      } catch (err) {
        console.error('Failed to fetch brands/categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newProduct = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock || 0),
      features: formData.features.split(',').map((f) => f.trim()).filter(f => f),
      status: 'active'
    };

    try {
      await adminService.createProduct(newProduct);
      alert('Product added successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold text-dark mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600">Fill in the details to add a new product</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter product name"
              />
            </div>

            {/* Brand and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="input-field"
                  disabled={loading}
                >
                  {brands.map((brand) => (
                    <option key={brand.id || brand.name} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input-field"
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field"
                placeholder="Enter product description"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (comma-separated) *
              </label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate features with commas
              </p>
            </div>

            {/* In Stock */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="w-4 h-4 text-primary focus:ring-primary rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Product is in stock
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Add Product
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
