import { createContext, useContext, useState, useEffect } from 'react';
import customerService from '../services/customerService';
import adminService from '../services/adminService';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await customerService.getProducts(filters);
      const rawProducts = data || [];
      
      // Global deduplication and normalization by ID to match backend entity
      const uniqueProductsMap = new Map();
      
      rawProducts.forEach(item => {
        if (!item.id) return;
        
        // Match backend fields
        const stockValue = item.stockQuantity !== undefined ? item.stockQuantity : 
                          (item.stock !== undefined ? item.stock : 
                          (item.quantity !== undefined ? item.quantity : 0));
        
        uniqueProductsMap.set(item.id, {
          ...item,
          image: item.mainImage || item.image || '/Logo2.png',
          mainImage: item.mainImage || item.image || '/Logo2.png',
          stock: Math.max(0, parseInt(stockValue)),
          stockQuantity: Math.max(0, parseInt(stockValue)),
          category: typeof item.category === 'object' ? item.category : { name: String(item.category || 'General') },
          brand: typeof item.brand === 'object' ? item.brand : { name: String(item.brand || 'Generic') },
          active: item.active !== undefined ? item.active : true
        });
      });
      
      setProducts(Array.from(uniqueProductsMap.values()));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductById = async (id) => {
    // If we have it in state, return it, otherwise fetch
    const existing = products.find((product) => product.id.toString() === id.toString());
    if (existing) return existing;
    
    try {
      return await customerService.getProductById(id);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      return null;
    }
  };

  const searchProducts = async (query) => {
    if (!query) return products;
    return await customerService.getProducts({ search: query });
  };

  const addProduct = async (productData) => {
    try {
      await adminService.createProduct(productData);
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Context: Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      await adminService.updateProduct(id, productData);
      await fetchProducts();
      return true;
    } catch (error) {
      console.error(`Context: Failed to update product ${id}:`, error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await adminService.deleteProduct(id);
      await fetchProducts();
      return true;
    } catch (error) {
      console.error(`Context: Failed to delete product ${id}:`, error);
      throw error;
    }
  };

  const value = {
    products,
    loading,
    fetchProducts,
    getProductById,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
