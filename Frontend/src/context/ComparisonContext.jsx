import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState(() => {
    const saved = localStorage.getItem('comparison_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparison_items', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToComparison = (product) => {
    if (comparedProducts.find(p => p.id === product.id)) {
      setComparedProducts(comparedProducts.filter(p => p.id !== product.id));
      toast.success('Removed from comparison');
      return;
    }

    if (comparedProducts.length >= 4) {
      toast.error('You can compare up to 4 products at once.');
      return;
    }

    setComparedProducts([...comparedProducts, product]);
    toast.success('Added to comparison');
  };

  const removeFromComparison = (productId) => {
    setComparedProducts(comparedProducts.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setComparedProducts([]);
  };

  const isInComparison = (productId) => {
    return comparedProducts.some(p => p.id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparedProducts,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
