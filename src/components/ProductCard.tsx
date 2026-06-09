import React from "react";
import { Star, Eye, Plus } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetails, onQuickAdd }: ProductCardProps) {
  // Format price as currency (COP style: $45.000)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative bg-white border-2 border-black flex flex-col justify-between transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Product Tag Badge corner */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isNew && (
          <span className="bg-black text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 text-center border border-black">
            NUEVO
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-white text-black border-2 border-black text-[9px] font-black tracking-widest uppercase px-2.5 py-1 text-center">
            DESTACADO
          </span>
        )}
      </div>

      {/* Image with hover actions */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 border-b-2 border-black">
        <img
          src={product.mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover overlay of quick actions */}
        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenDetails(product)}
            className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors duration-200 text-black duration-150"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => onQuickAdd(product)}
            className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors duration-200 text-black duration-150"
            title="Añadir directo"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Hover size overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-2.5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t-2 border-black flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-black text-black tracking-wider uppercase mr-1">TALLAS:</span>
          {product.sizeOptions.map((sz) => (
            <span
              key={sz}
              className="text-[9px] font-black text-black border border-black px-1.5 py-0.5 pointer-events-none"
            >
              {sz}
            </span>
          ))}
        </div>
      </div>

      {/* Product metadata Info section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
            {product.category}
          </span>
          <h3 className="mt-1 font-sans text-sm font-black text-black uppercase group-hover:text-black line-clamp-1 tracking-tight">
            {product.name}
          </h3>
          
          {/* Star ratings */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center text-black">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[10px] font-black text-black">{product.rating}</span>
            <span className="text-[10px] text-neutral-400 font-medium font-mono">({product.reviewsCount})</span>
          </div>
        </div>

        <div className="mt-3.5 pt-3.5 border-t-2 border-neutral-100 flex items-center justify-between">
          <span className="font-sans text-xs font-black text-black bg-neutral-100 px-2 py-1 border border-black uppercase tracking-wider">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onOpenDetails(product)}
            className="text-[9px] font-black tracking-widest uppercase text-black border-b-2 border-black transition-all pb-0.5 hover:text-neutral-500 hover:border-neutral-500"
          >
            VER DETALLES
          </button>
        </div>
      </div>

    </div>
  );
}
