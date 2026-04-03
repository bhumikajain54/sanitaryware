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
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = formData.image;

      // 1. Convert to Base64 if a new file is selected (Base64 Armor)
      if (imageFile) {
        try {
          finalImageUrl = await fileToBase64(imageFile);
        } catch (err) {
          console.error('Base64 conversion failed:', err);
          throw new Error('Failed to process image file');
        }
      }

      // 2. Prepare final product data with direct DB storage
      const newProduct = {
        ...formData,
        mainImage: finalImageUrl, // Map to backend entity field for persistence
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock || 0),
        active: formData.inStock,
      };

      await adminService.createProduct(newProduct);
      alert('Product added successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to add product:', err);
      alert(err.response?.data?.message || 'Failed to add product: ' + err.message);
    } finally {
      setUploading(false);
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

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Image *
              </label>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group relative overflow-hidden">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <img src={preview} alt="Upload preview" className="w-full h-full object-contain bg-white" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-slate-400 group-hover:text-teal-600 transition-colors">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                       </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-tighter">Click to upload product image</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                )}
              </div>
              
              {/* Progress Indicator */}
              {uploading && (
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                   <div className="bg-teal-500 h-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                </div>
              )}
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
              <button 
                type="submit" 
                disabled={uploading || loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Processing...' : 'Add Product'}
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
