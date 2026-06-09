import React, { useState } from "react";
import { X, Star, Check, HelpCircle, Shield, RotateCcw, Truck } from "lucide-react";
import { Product, ProductSize } from "../types";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: ProductSize, color: string, quantity: number) => void;
}

export default function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState(product.mainImage);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizeOptions[0]);
  const [selectedColor, setSelectedColor] = useState<string>(product.colorOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    setQuantity(quantity + 1);
  };

  const handleAddSubmit = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel container */}
        <div className="relative transform overflow-hidden bg-white text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all sm:my-8 sm:w-full sm:max-w-4xl border-4 border-black flex flex-col md:flex-row">
          
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 bg-white hover:bg-black hover:text-white text-black border-2 border-black transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Left: Gallery and Images */}
          <div className="w-full md:w-1/2 p-6 bg-neutral-50 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
            <div className="flex-grow flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-[350px] w-auto object-contain object-center mix-blend-multiply scale-102"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Gallery thumbnails */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="mt-4 flex gap-2 justify-center">
                {product.galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-20 bg-white border-2 overflow-hidden ${
                      selectedImage === img ? "border-black" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Galería ${i}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product specs + selectors */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-white">
            <div>
              {/* Category */}
              <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                COLECCIÓN CACAO // {product.category}
              </span>
              
              {/* Title */}
              <h1 className="mt-1 text-3xl font-black text-black tracking-tighter uppercase leading-none">
                {product.name}
              </h1>

              {/* Rating + Reviews */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="flex items-center text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? "fill-current" : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-black ml-1 font-mono">{product.rating}</span>
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider font-sans">({product.reviewsCount} RESEÑAS)</span>
              </div>

              {/* Price */}
              <div className="mt-4 inline-block bg-black text-white text-base sm:text-lg font-black font-mono tracking-wider px-3.5 py-1.5 border border-black uppercase">
                {formatPrice(product.price)}
              </div>

              {/* Short description */}
              <p className="mt-4 text-xs sm:text-sm text-neutral-700 leading-relaxed font-semibold">
                {product.description}
              </p>

              {/* Colors selector */}
              <div className="mt-6">
                <h3 className="text-xs font-black uppercase text-black tracking-widest mb-2">
                  COLOR: <span className="font-bold text-neutral-400">{selectedColor}</span>
                </h3>
                <div className="flex gap-2.5">
                  {product.colorOptions.map((color) => {
                    const isDark = color.includes("Negro") || color.includes("Carbón");
                    const isWhite = color.includes("Blanco");
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center justify-center p-0.5 border-2 transition-all ${
                          selectedColor === color ? "border-black bg-neutral-50" : "border-neutral-200 hover:border-black"
                        }`}
                        title={color}
                      >
                        <span
                          className={`w-5.5 h-5.5 border border-black block ${
                            isDark ? "bg-black" : isWhite ? "bg-white" : "bg-neutral-400"
                          }`}
                        />
                        {selectedColor === color && (
                          <Check className={`absolute w-3.5 h-3.5 stroke-[3.5] ${isWhite ? "text-black" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes selector */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase text-black tracking-widest">
                    TALLA SELECCIONADA: <span className="text-black bg-neutral-100 px-2 py-0.5 border border-black">{selectedSize}</span>
                  </h3>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[9px] font-black text-neutral-400 hover:text-black flex items-center gap-1 uppercase"
                  >
                    <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" /> GUÍA DE TALLAS
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizeOptions.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-11 min-w-11 px-3.5 text-xs font-black transition-all border-2 ${
                        selectedSize === sz
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-neutral-300 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom specs checklist on demand */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-neutral-100">
                  <h4 className="text-[10px] font-black uppercase text-black tracking-widest mb-2.5">ESPECIFICACIONES TÉCNICAS</h4>
                  <ul className="grid grid-cols-2 gap-2 text-[10px] text-neutral-700 font-bold uppercase tracking-wider">
                    {product.specifications.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-black shrink-0" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions quantity & buy button */}
            <div className="mt-8 pt-4 border-t-2 border-neutral-100">
              <div className="flex items-center gap-4">
                
                {/* Qty Selector */}
                <div className="flex h-12 w-32 border-2 border-black">
                  <button
                    onClick={handleDecreaseQty}
                    className="w-10 bg-white font-black text-sm text-black hover:bg-neutral-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="flex-1 flex items-center justify-center font-black text-xs text-black bg-neutral-100 select-none font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="w-10 bg-white font-black text-sm text-black hover:bg-neutral-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  onClick={handleAddSubmit}
                  disabled={addedMessage}
                  className={`flex-1 h-12 flex items-center justify-center font-black text-xs tracking-widest uppercase transition-all duration-200 border-2 border-black ${
                    addedMessage
                      ? "bg-neutral-100 text-neutral-400 border-neutral-300"
                      : "bg-black text-white hover:bg-white hover:text-black cursor-pointer"
                  }`}
                >
                  {addedMessage ? "AGREGADO ✓" : "AGREGAR AL CARRITO"}
                </button>
              </div>

              {/* Guarantees shortcuts */}
              <div className="mt-4 flex justify-between text-[10px] text-black uppercase font-black tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-black stroke-[2.5]" /> SATISFACCIÓN GARANTIZADA
                </span>
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-black stroke-[2.5]" /> DEVOLUCIONES 30 DÍAS
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Embedded Mini Size Guide Popup */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setShowSizeGuide(false)}
          ></div>
          <div className="relative bg-white p-6 max-w-md w-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-2.5 hover:bg-neutral-100 text-black border border-black bg-white"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4 flex items-center gap-1.5">
              <span>GUÍA DE TALLAS RECOMENDADA</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-black font-sans border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-neutral-100 font-black uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left">Talla</th>
                    <th className="py-2.5 px-3 text-left">Cintura</th>
                    <th className="py-2.5 px-3 text-left">Pecho</th>
                    <th className="py-2.5 px-3 text-left">Cadera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20 font-bold uppercase">
                  <tr>
                    <td className="py-2 px-3 font-black text-black">XS</td>
                    <td className="py-2 px-3">68-72 cm</td>
                    <td className="py-2 px-3">80-84 cm</td>
                    <td className="py-2 px-3">82-86 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-black text-black">S</td>
                    <td className="py-2 px-3">73-77 cm</td>
                    <td className="py-2 px-3">85-89 cm</td>
                    <td className="py-2 px-3">87-91 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-black text-black">M</td>
                    <td className="py-2 px-3">78-83 cm</td>
                    <td className="py-2 px-3">90-95 cm</td>
                    <td className="py-2 px-3">92-97 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-black text-black">L</td>
                    <td className="py-2 px-3">84-89 cm</td>
                    <td className="py-2 px-3">96-101 cm</td>
                    <td className="py-2 px-3">98-103 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-black text-black">XL</td>
                    <td className="py-2 px-3">90-95 cm</td>
                    <td className="py-2 px-3">102-107 cm</td>
                    <td className="py-2 px-3">104-109 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
              * Si te encuentras entre dos tallas, te recomendamos seleccionar la talla superior para mayor comodidad.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
