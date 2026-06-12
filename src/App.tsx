import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Compass, Sliders, X } from "lucide-react";
import { Product, CartItem, Order, FiltersState, ProductCategory, ProductSize, OrderStatus } from "./types";
import { db } from "./firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import FiltersSidebar from "./components/FiltersSidebar";
import CartDrawer from "./components/CartDrawer";
import Logo from "./components/Logo";

import AdminPanel from "./components/AdminPanel";

const DEFAULT_FILTERS: FiltersState = {
  category: "All",
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 600000,
  isPriceFilterActive: false,
  sortBy: "featured",
};

export default function App() {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  
  // Shopping cart persistence using localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cacao_cart_items");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Orders persistence using localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("cacao_orders_database");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [firebaseProducts, setFirebaseProducts] = useState<Product[]>([]);

  // Fetch products from Firestore
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsub = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        prods.push({
          id: data.id || doc.id,
          name: data.name,
          price: data.price,
          description: data.description,
          category: data.category as ProductCategory,
          sizeOptions: data.sizeOptions || [],
          colorOptions: data.colorOptions || [],
          mainImage: data.mainImage,
          galleryImages: data.galleryImages || [],
          rating: data.rating || 5,
          reviewsCount: data.reviewsCount || 0,
          isNew: data.isNew ?? true,
          isFeatured: data.isFeatured ?? false,
          specifications: data.specifications || []
        });
      });
      console.log("✅ Fetched firebaseProducts:", prods);
      setFirebaseProducts(prods);
    }, (error) => {
      console.error("❌ Firestore products error: ", error);
    });
    return () => unsub();
  }, []);

  // Sync state variations in local storage
  useEffect(() => {
    localStorage.setItem("cacao_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("cacao_orders_database", JSON.stringify(orders));
  }, [orders]);

  // Sync category selected from slide clicks
  const handleSelectSliderCategory = (category: ProductCategory | "All") => {
    setFilters({ ...DEFAULT_FILTERS, category });
    // Scroll window smoothly down to product listing catalogs
    const catalogueEl = document.getElementById("catalogo-ropa");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: ProductSize, color: string, quantity: number) => {
    const itemId = `${product.id}-${size}-${color}`;
    const stockKey = `${size}-${color}`;
    const stockQty = (product.stock && product.stock[stockKey] !== undefined) ? product.stock[stockKey] : Infinity;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity = Math.min(updated[existingIndex].quantity + quantity, stockQty);
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            product,
            quantity: Math.min(quantity, stockQty),
            selectedSize: size,
            selectedColor: color,
          },
        ];
      }
    });
  };

  const handleQuickAdd = (product: Product) => {
    // Select the first available size and color that has stock
    let defaultSize = product.sizeOptions[0];
    let defaultColor = product.colorOptions[0];
    
    // Find first comb with stock
    if (product.stock && Object.keys(product.stock).length > 0) {
      loop:
      for (const sz of product.sizeOptions) {
        for (const col of product.colorOptions) {
           if (product.stock[`${sz}-${col}`] > 0) {
             defaultSize = sz;
             defaultColor = col;
             break loop;
           }
        }
      }
    }
    
    handleAddToCart(product, defaultSize, defaultColor, 1);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
           const stockQty = (item.product.stock && item.product.stock[`${item.selectedSize}-${item.selectedColor}`] !== undefined) ? item.product.stock[`${item.selectedSize}-${item.selectedColor}`] : Infinity;
           return { ...item, quantity: Math.min(qty, stockQty) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Creating full trackable order upon checkout checkout
  const handlePlaceOrder = async (
    customerInfo: { name: string; email: string; address: string; city: string },
    discountVal: number
  ) => {
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CACAO-${codeSuffix}`;
    const trackerCode = `CACAO-TRK-${Math.random().toString(36).substring(2, 6)}`;

    // Decrement stock in Firebase
    for (const item of cartItems) {
      if (item.product.id && !item.product.id.startsWith("prod-")) { // Ensure it's a Firebase product id, but we can try to update anyway
        try {
          const { doc, getDoc, updateDoc } = await import("firebase/firestore");
          const productRef = doc(db, "products", item.product.id);
          const snap = await getDoc(productRef);
          if (snap.exists()) {
             const prodData = snap.data();
             const currentStock = prodData.stock || {};
             const key = `${item.selectedSize}-${item.selectedColor}`;
             if (currentStock[key] !== undefined) {
               currentStock[key] = Math.max(0, currentStock[key] - item.quantity);
               await updateDoc(productRef, { stock: currentStock });
             }
          }
        } catch (error) {
          console.error("Error updating stock", error);
        }
      }
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const rawDiscount = Math.round(subtotal * (discountVal / 100));
    const shippingCost = subtotal > 80000 || subtotal === 0 ? 0 : 8000;
    const total = subtotal - rawDiscount + shippingCost;

    const formattedToday = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newOrder: Order = {
      id: orderId,
      trackerCode,
      items: [...cartItems],
      subtotal,
      shippingCost,
      total,
      status: "confirmado",
      date: new Date().toISOString().split("T")[0],
      estimatedDelivery: "En 2-3 días hábiles",
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerAddress: customerInfo.address,
      customerCity: customerInfo.city,
      timeline: [
        {
          status: "confirmado",
          label: "Pedido Confirmado",
          description: "Hemos recibido tu pedido de forma segura en nuestros servidores.",
          time: formattedToday,
          completed: true,
        },
        {
          status: "preparacion",
          label: "Preparación de Paquete",
          description: "Tus prendas seleccionadas están siendo armadas y empacadas.",
          time: "Pendiente",
          completed: false,
        },
        {
          status: "en_camino",
          label: "En Camino / Tránsito",
          description: "El paquete fue despachado al courier para entrega rápida.",
          time: "Pendiente",
          completed: false,
        },
        {
          status: "entregado",
          label: "Entregado",
          description: "El paquete fue entregado de forma segura en tus manos.",
          time: "Pendiente",
          completed: false,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Filter application algorithms
  const filteredProducts = firebaseProducts.filter((prod) => {
    // 1. Search Query
    if (searchValue) {
      const q = searchValue.toLowerCase();
      const matchesName = prod.name.toLowerCase().includes(q);
      const matchesDesc = prod.description.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }

    // 2. Category
    if (filters.category !== "All" && prod.category !== filters.category) {
      return false;
    }

    // 3. Sizes (match any selected size)
    if (filters.sizes.length > 0) {
      const hasSize = prod.sizeOptions.some((sz) => filters.sizes.includes(sz));
      if (!hasSize) return false;
    }

    // 4. Colors (match color substrings)
    if (filters.colors.length > 0) {
      const hasColor = prod.colorOptions.some((col) => {
        return filters.colors.some((fc) => col.toLowerCase().includes(fc.toLowerCase()) || fc.toLowerCase().includes(col.toLowerCase()));
      });
      if (!hasColor) return false;
    }

    // 5. Price
    if (filters.isPriceFilterActive) {
      if (prod.price > filters.maxPrice || prod.price < filters.minPrice) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "priceAsc") {
      return a.price - b.price;
    }
    if (filters.sortBy === "priceDesc") {
      return b.price - a.price;
    }
    if (filters.sortBy === "rating") {
      return b.rating - a.rating;
    }
    // Default or "featured": premium items first, then new
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-between">
      
      {/* Navigation bar integration */}
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <div>
              {/* Smooth auto-sliding banner */}
              <HeroSlider onSelectCategory={handleSelectSliderCategory} />

              {/* Core Boutique grid area */}
              <div id="catalogo-ropa" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
                
                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Mobile Filters Toggle Button */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                    >
                      <Sliders className="w-4 h-4 stroke-[2.5]" /> Mostrar Filtros
                    </button>
                  </div>

                  {/* Advanced facet filters (Desktop: left sidebar, Mobile: Drawer) */}
                  <aside className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white overflow-y-auto transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-1/4 lg:max-w-none lg:translate-x-0 lg:overflow-visible ${isMobileFiltersOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
                    <div className="lg:hidden p-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-white z-10">
                      <span className="font-black text-xs uppercase tracking-widest">Filtros</span>
                      <button onClick={() => setIsMobileFiltersOpen(false)} className="text-black hover:text-neutral-500">
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                    <FiltersSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                    />
                  </aside>

                  {/* Overlay for Mobile Filters Drawer */}
                  {isMobileFiltersOpen && (
                    <div 
                      className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity" 
                      onClick={() => setIsMobileFiltersOpen(false)} 
                    />
                  )}

                  {/* Garments items catalogue list on the right */}
                  <section className="flex-grow flex flex-col gap-6">
                    
                    {/* Results counts indicator */}
                    <div className="flex justify-between items-center border-b-2 border-black pb-3">
                      <span className="text-xs font-black text-black uppercase tracking-widest">
                        MOSTRANDO {filteredProducts.length} DE {firebaseProducts.length} PRENDAS
                      </span>
                      {searchValue && (
                        <span className="text-xs text-black font-black uppercase tracking-wider">
                          FILTRANDO: "{searchValue.toUpperCase()}"
                        </span>
                      )}
                    </div>

                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onOpenDetails={setSelectedProduct}
                            onQuickAdd={handleQuickAdd}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Empty state search mismatch */
                      <div className="text-center py-20 bg-neutral-50 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <Compass className="w-12 h-12 text-black mx-auto stroke-[3]" />
                        <h3 className="text-sm font-black text-black uppercase mt-4 tracking-widest">SIN COINCIDENCIAS CON LA BÚSQUEDA</h3>
                        <p className="mt-1.5 text-xs text-neutral-400 max-w-xs mx-auto font-bold uppercase tracking-wider">
                          Prueba desmarcando filtros de talla, color o ampliando el rango de valor.
                        </p>
                        <button
                          onClick={() => {
                            setFilters(DEFAULT_FILTERS);
                            setSearchValue("");
                          }}
                          className="mt-6 px-6 py-3.5 bg-black border-2 border-black text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                          RESETEAR TODO
                        </button>
                      </div>
                    )}

                  </section>

                </div>

              </div>

              {/* Premium Brand values banner */}
              <div className="bg-neutral-50 border-t-2 border-b-2 border-black py-16 text-center select-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-black mb-3 font-mono bg-neutral-200 border-2 border-black px-3.5 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[15px]">01</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-black mb-1.5">ALTA INGENIERÍA TEXTIL</h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-bold uppercase tracking-wide max-w-xs">
                        Fibras hidrofílicas duales microperforadas que absorben el sudor al instante para mantener tu temperatura óptima siempre.
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-black mb-3 font-mono bg-neutral-200 border-2 border-black px-3.5 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[15px]">02</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-black mb-1.5">OPACIDAD SQUAT-PROOF 100%</h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-bold uppercase tracking-wide max-w-xs">
                        Tejidos con hilados de triple rotación entrelazada garantizando estiramiento multidimensional sin transparencias.
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-black mb-3 font-mono bg-neutral-200 border-2 border-black px-3.5 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[15px]">03</span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-black mb-1.5">EMBALAJE CONCIENTE ECO SOBRIO</h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-bold uppercase tracking-wide max-w-xs">
                        Entregamos de forma express tus prendas en cajas minimalistas prensadas de cartón orgánico 100% reciclable libre de plástico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          } />

          <Route path="/panel" element={
            <div className="bg-white min-h-[30rem]">
              <AdminPanel />
            </div>
          } />
        </Routes>
      </main>

      {/* Elegant, minimalist dark boutique footer */}
      <footer className="bg-neutral-950 text-white pt-16 pb-8 border-t-4 border-black select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Brand description and values */}
            <div>
              <Logo className="h-14 hover:opacity-80 transition-opacity duration-300 cursor-pointer" isFooter={true} />
              <p className="mt-4 text-[10px] text-neutral-400 font-bold uppercase tracking-wider leading-relaxed max-w-xs">
                Cacao diseña indumentaria deportiva para atletas que demandan elegancia sobria, soporte de compresión muscular de primer nivel y un estilo depurado en blanco, gris y negro.
              </p>
            </div>

            {/* Column 2: Quick Style links */}
            <div>
              <h5 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-4">MAPEO DE ESTILOS</h5>
              <div className="flex flex-col gap-2.5 text-xs text-neutral-300 font-black uppercase tracking-wider">
                <button onClick={() => { navigate('/'); handleSelectSliderCategory("Enterizos"); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer">Enterizos</button>
                <button onClick={() => { navigate('/'); handleSelectSliderCategory("Shorts"); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer">Shorts Técnicos</button>
                <button onClick={() => { navigate('/'); handleSelectSliderCategory("Camisas"); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer">Playeras y Camisetas</button>
                <button onClick={() => { navigate('/'); handleSelectSliderCategory("Leggins"); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer">Leggings de Compresión</button>
                <button onClick={() => { navigate('/'); handleSelectSliderCategory("Chaquetas"); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer">Cortavientos y Chaquetas</button>
              </div>
            </div>

            {/* Column 3: Trust and support */}
            <div>
              <h5 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-4">SOPORTE EXPRESS</h5>
              <div className="flex flex-col gap-2.5 text-xs text-neutral-300 font-black uppercase tracking-wider">
                <span className="text-left text-neutral-400 cursor-default text-[9px] font-bold">Atención Personalizada de Lunes a Sábado</span>
                <span className="text-left font-black text-white hover:text-amber-400 text-[10px] break-all">cacao.cosport@gmail.com</span>
                <button onClick={() => { navigate("/panel"); setSearchedOrderCode(null); }} className="hover:text-amber-400 transition-colors text-left text-[10px] cursor-pointer mt-4">Acceso Administrativo</button>
              </div>
            </div>

            {/* Column 4: Newsletter signups */}
            <div>
              <h5 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-4">ACCESO AVANT-GARDE</h5>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-3 leading-relaxed">Subscríbete para ser el primero en recibir notificaciones sobre drops exclusivos y ediciones súper limitadas.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="EMAIL@CACAOACTIVEWEAR.COM"
                  className="bg-neutral-900 text-xs px-3.5 py-3 outline-none border-2 border-neutral-800 text-white flex-grow placeholder-neutral-600 focus:border-white font-black uppercase tracking-widest"
                />
                <button className="px-4 py-3 bg-white text-black text-xs font-black hover:bg-neutral-200 transition-colors uppercase border-2 border-white cursor-pointer">DROP</button>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-500 font-black uppercase tracking-wider gap-4">
            <span>© 2026 Cacao Activewear. Todos los derechos reservados.</span>
            <div className="flex gap-6">
              <span>Hecho en Colombia</span>
              <span>Políticas de Garantías</span>
              <span>Envío Confiable</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Selected Product specifications overlay */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart side drawer overlay */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
      />

    </div>
  );
}
