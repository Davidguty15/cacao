import React from "react";
import { SlidersHorizontal, Sliders, RefreshCw, Star, ArrowUpDown } from "lucide-react";
import { ProductCategory, ProductSize, FiltersState } from "../types";

interface FiltersSidebarProps {
  filters: FiltersState;
  onFiltersChange: (newFilters: FiltersState) => void;
  onResetFilters: () => void;
}

const CATEGORIES: (ProductCategory | "All")[] = ["All", "Shorts", "Camisas", "Leggins", "Chaquetas"];
const SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Negro Obsidiana", "Gris Plata", "Blanco Óptico", "Gris Carbón"];

export default function FiltersSidebar({ filters, onFiltersChange, onResetFilters }: FiltersSidebarProps) {
  
  const handleCategoryClick = (category: ProductCategory | "All") => {
    onFiltersChange({ ...filters, category });
  };

  const handleSizeToggle = (size: ProductSize) => {
    const isSelected = filters.sizes.includes(size);
    const updatedSizes = isSelected
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: updatedSizes });
  };

  const handleColorToggle = (color: string) => {
    const isSelected = filters.colors.includes(color);
    const updatedColors = isSelected
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: updatedColors });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isMax: boolean) => {
    const value = parseInt(e.target.value) || 0;
    if (isMax) {
      onFiltersChange({ ...filters, maxPrice: value });
    } else {
      onFiltersChange({ ...filters, minPrice: value });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as FiltersState["sortBy"],
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };  return (
    <div className="bg-white border-2 border-black p-6 flex flex-col gap-6 sticky top-28 select-none">
      
      {/* Header filter title and reset clicker */}
      <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-4">
        <h2 className="text-xs font-black tracking-widest uppercase text-black flex items-center gap-2">
          <Sliders className="w-4 h-4 text-black stroke-[2.5]" /> FILTROS AVANZADOS
        </h2>
        <button
          onClick={onResetFilters}
          className="text-[10px] font-black text-neutral-400 hover:text-black hover:underline transition-all flex items-center gap-1 uppercase"
          title="Limpiar filtros"
        >
          <RefreshCw className="w-3 h-3 stroke-[2.5]" /> REINICIAR
        </button>
      </div>

      {/* Sorting selector facet */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-black tracking-widest mb-2.5 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" /> ORDENAR POR
        </h3>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full bg-neutral-50 text-xs font-black uppercase tracking-wider px-3 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-white cursor-pointer text-black"
        >
          <option value="featured">DESTACADO (CACAO)</option>
          <option value="priceAsc">MENOR PRECIO</option>
          <option value="priceDesc">MAYOR PRECIO</option>
          <option value="rating">MEJOR CALIFICACIÓN</option>
        </select>
      </div>

      {/* Category Selection Facet */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-black tracking-widest mb-3">ESTILOS DE PRENDA</h3>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const label = cat === "All" ? "Ver Todo" : cat;
            const isActive = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs uppercase transition-all ${
                  isActive
                    ? "font-black text-black bg-neutral-100 border-l-4 border-black"
                    : "font-medium text-neutral-500 hover:text-black hover:bg-neutral-50"
                }`}
              >
                <span>{label}</span>
                {isActive && <span className="w-2 h-2 bg-black shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes Selection Facet (tallas) */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-black tracking-widest mb-3">TALLAS DISPONIBLES</h3>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((sz) => {
            const isSelected = filters.sizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => handleSizeToggle(sz)}
                className={`h-10 text-xs font-black transition-all border-2 ${
                  isSelected
                    ? "bg-black text-white border-black shadow-inner"
                    : "bg-white text-black border-neutral-300 hover:border-black"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Selection Facet */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-black tracking-widest mb-3">GAMA DE COLOR</h3>
        <div className="flex flex-col gap-2">
          {COLORS.map((col) => {
            const isSelected = filters.colors.includes(col);
            const isDark = col.includes("Negro") || col.includes("Carbón");
            const isWhite = col.includes("Blanco");

            return (
              <button
                key={col}
                onClick={() => handleColorToggle(col)}
                className={`flex items-center gap-3 px-3 py-2 border-2 transition-all text-xs uppercase ${
                  isSelected ? "border-black bg-neutral-50/50" : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 border border-black block shrink-0 ${
                    isDark ? "bg-black" : isWhite ? "bg-white" : "bg-neutral-400"
                  }`}
                />
                <span className={`tracking-wider ${isSelected ? "text-black font-black" : "text-neutral-600 font-semibold"}`}>
                  {col}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider Facet */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-black tracking-widest mb-2.5">PRECIO MÁXIMO</h3>
        
        <input
          type="range"
          min="30000"
          max="120000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => handlePriceChange(e, true)}
          className="w-full h-2 bg-neutral-100 border-2 border-black outline-none cursor-pointer appearance-none"
        />

        <div className="mt-3 flex items-center justify-between text-xs font-black text-black font-sans">
          <span>{formatPrice(30000)}</span>
          <span className="bg-black text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 border border-black">
            HASTA {formatPrice(filters.maxPrice)}
          </span>
        </div>
      </div>

    </div>
  );
}
