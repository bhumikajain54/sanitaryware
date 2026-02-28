import React from 'react';
import { MdSearch, MdClose } from 'react-icons/md';

const ProductSidebarFilter = ({
    searchQuery,
    setSearchQuery,
    selectedCategories = [],
    setSelectedCategories,
    categories,
    selectedBrands = [],
    setSelectedBrands,
    brands,
    priceRange,
    setPriceRange,
    minPrice = 0,
    maxPrice = 100000,
    onClearFilters,
    selectedTypes = [],
    setSelectedTypes,
    types = []
}) => {
    return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-5 md:p-7 shadow-sm lg:sticky lg:top-24">
            {/* Search */}
            <div className="mb-10">
                <h3 className="text-sm font-black text-[var(--text-main)] mb-5 tracking-tight uppercase">Search</h3>
                <div className="relative group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xl group-focus-within:text-teal-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-[var(--bg-card)] transition-all text-sm font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                    />
                </div>
            </div>

            {/* Category */}
            <div className="mb-10">
                <h3 className="text-sm font-black text-[var(--text-main)] mb-5 tracking-tight uppercase">Category</h3>
                <div className="space-y-3.5">
                    {categories.map((cat) => (
                        <label key={cat.value} className="flex items-center group cursor-pointer">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.value)}
                                    onChange={() => {
                                        if (cat.value === 'all') {
                                            setSelectedCategories(['all']);
                                        } else {
                                            let newCats = selectedCategories.filter(c => c !== 'all');
                                            if (newCats.includes(cat.value)) {
                                                newCats = newCats.filter(c => c !== cat.value);
                                                if (newCats.length === 0) newCats = ['all'];
                                                setSelectedCategories(newCats);
                                            } else {
                                                setSelectedCategories([...newCats, cat.value]);
                                            }
                                        }
                                    }}
                                    className="peer appearance-none w-5.5 h-5.5 border-2 border-[var(--border-main)] rounded-md checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer hover:border-teal-500 bg-[var(--bg-app)]"
                                />
                                <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-110 transition-transform m-auto inset-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={`ml-3 text-[15px] font-bold transition-colors ${selectedCategories.includes(cat.value) ? 'text-teal-600' : 'text-[var(--text-muted)] group-hover:text-teal-600'}`}>
                                {cat.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand */}
            <div className="mb-10">
                <h3 className="text-sm font-black text-[var(--text-main)] mb-5 tracking-tight uppercase">Brand</h3>
                <div className="space-y-3.5">
                    {brands.map((brand) => (
                        <label key={brand.value} className="flex items-center group cursor-pointer">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand.value)}
                                    onChange={() => {
                                        if (brand.value === 'all') {
                                            setSelectedBrands(['all']);
                                        } else {
                                            let newBrands = selectedBrands.filter(b => b !== 'all');
                                            if (newBrands.includes(brand.value)) {
                                                newBrands = newBrands.filter(b => b !== brand.value);
                                                if (newBrands.length === 0) newBrands = ['all'];
                                                setSelectedBrands(newBrands);
                                            } else {
                                                setSelectedBrands([...newBrands, brand.value]);
                                            }
                                        }
                                    }}
                                    className="peer appearance-none w-5.5 h-5.5 border-2 border-[var(--border-main)] rounded-md checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer hover:border-teal-500 bg-[var(--bg-app)]"
                                />
                                <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-110 transition-transform m-auto inset-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={`ml-3 text-[15px] font-bold transition-colors ${selectedBrands.includes(brand.value) ? 'text-teal-600' : 'text-[var(--text-muted)] group-hover:text-teal-600'}`}>
                                {brand.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Type */}
            <div className="mb-10">
                <h3 className="text-sm font-black text-[var(--text-main)] mb-5 tracking-tight uppercase">Type</h3>
                <div className="space-y-3.5">
                    {types.map((type) => (
                        <label key={type.value || type} className="flex items-center group cursor-pointer">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type.value || type)}
                                    onChange={() => {
                                        const value = type.value || type;
                                        if (value === 'all') {
                                            setSelectedTypes(['all']);
                                        } else {
                                            let newTypes = selectedTypes.filter(t => t !== 'all');
                                            if (newTypes.includes(value)) {
                                                newTypes = newTypes.filter(t => t !== value);
                                                if (newTypes.length === 0) newTypes = ['all'];
                                                setSelectedTypes(newTypes);
                                            } else {
                                                setSelectedTypes([...newTypes, value]);
                                            }
                                        }
                                    }}
                                    className="peer appearance-none w-5.5 h-5.5 border-2 border-[var(--border-main)] rounded-md checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer hover:border-teal-500 bg-[var(--bg-app)]"
                                />
                                <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-110 transition-transform m-auto inset-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={`ml-3 text-[15px] font-bold transition-colors ${selectedTypes.includes(type.value || type) ? 'text-teal-600' : 'text-[var(--text-muted)] group-hover:text-teal-600'}`}>
                                {type.label || type}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black text-[var(--text-main)] tracking-tight uppercase">Price Range</h3>
                    <span className="text-xs font-black px-2 py-1 bg-teal-500/10 text-teal-600 rounded-lg">MAX: ₹{priceRange.toLocaleString()}</span>
                </div>
                <div className="px-1">
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--bg-app)] rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between mt-3 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        <span>₹{minPrice.toLocaleString()}</span>
                        <span>₹{maxPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            <button
                onClick={onClearFilters}
                className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/10 transition-all active:scale-[0.98]"
            >
                Clear All Filters
            </button>
        </div>
    );
};

export default ProductSidebarFilter;
