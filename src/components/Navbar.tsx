import React, { useState } from "react";
import { ShoppingBag, Search, Compass, Truck, ShieldCheck, Heart } from "lucide-react";
import Logo from "./Logo";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeTab: "shop" | "tracking";
  setActiveTab: (tab: "shop" | "tracking") => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  activeTab,
  setActiveTab,
  onSearchChange,
  searchValue,
}: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-black transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("shop")}
              className="flex items-center focus:outline-none group active:scale-95 transition-transform"
              aria-label="Cacao Home"
            >
              <Logo className="h-24 text-black group-hover:scale-102 transition-transform duration-300" />
            </button>

            {/* Main Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("shop")}
                className={`text-xs font-black tracking-widest transition-colors duration-200 uppercase ${
                  activeTab === "shop"
                    ? "text-black border-b-2 border-black pb-1 pt-1"
                    : "text-neutral-400 hover:text-black hover:border-b-2 hover:border-neutral-200 pb-1 pt-1"
                }`}
              >
                Colección
              </button>
              <button
                onClick={() => setActiveTab("tracking")}
                className={`text-xs font-black tracking-widest transition-colors duration-200 uppercase flex items-center gap-1.5 ${
                  activeTab === "tracking"
                    ? "text-black border-b-2 border-black pb-1 pt-1"
                    : "text-neutral-400 hover:text-black hover:border-b-2 hover:border-neutral-200 pb-1 pt-1"
                }`}
              >
                <Truck className="w-4 h-4 text-black stroke-[2.5]" />
                Seguir Pedido
              </button>
            </nav>
          </div>

          {/* Quick Search and Action widgets */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Search inputs */}
            {activeTab === "shop" && (
              <div
                className={`relative hidden sm:flex items-center bg-neutral-50 px-3.5 py-1.5 border-2 transition-all duration-300 ${
                  isSearchFocused
                    ? "w-64 border-black bg-white"
                    : "w-48 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <Search className="w-4 h-4 text-black mr-2 stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Buscar prendas..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full text-[10px] font-black tracking-wider text-black bg-transparent placeholder-neutral-400 focus:outline-none uppercase"
                />
              </div>
            )}

            {/* Mobile Tab shortcuts */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={() => setActiveTab("shop")}
                className={`p-1.5 border ${
                  activeTab === "shop" ? "bg-black text-white border-black" : "text-neutral-500 border-neutral-200"
                }`}
                title="Tienda"
              >
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setActiveTab("tracking")}
                className={`p-1.5 border relative ${
                  activeTab === "tracking" ? "bg-black text-white border-black" : "text-neutral-500 border-neutral-200"
                }`}
                title="Seguimiento"
              >
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Shopping cart button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-neutral-50 hover:bg-black border-2 border-black text-black hover:text-white transition-all duration-300 group focus:outline-none"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.5] transition-transform group-hover:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-black text-white text-[10px] font-black border border-white group-hover:bg-white group-hover:text-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Tiny banner for trust */}
      <div className="bg-black py-2.5 text-center text-[10px] sm:text-xs font-black text-white tracking-widest uppercase flex items-center justify-center gap-6 overflow-hidden border-t border-neutral-900">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-neutral-300 stroke-[2.5]" /> Pago Seguro
        </span>
        <span className="hidden sm:inline text-neutral-800">|</span>
        <span>Envío Premium Express Gratis desde $80.000</span>
        <span className="hidden sm:inline text-neutral-800">|</span>
        <span className="hidden sm:inline">Colección Limitada de Alta Costura</span>
      </div>
    </header>
  );
}
