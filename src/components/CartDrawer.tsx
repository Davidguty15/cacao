import React, { useState } from "react";
import { X, Trash2, ShoppingBag, CreditCard, Gift, ShieldAlert, BadgePercent, MapPin } from "lucide-react";
import { CartItem, ProductSize, Order } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: (customerInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
  }, discountVal: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0); // 10% coupon
  const [couponMessage, setCouponMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Checkout address form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bogotá");

  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const subtotal = getSubtotal();
  const rawDiscount = Math.round(subtotal * (discountPercent / 100));
  const shippingCost = subtotal > 80000 || subtotal === 0 ? 0 : 8000;
  const total = subtotal - rawDiscount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "CACAO10") {
      setDiscountPercent(10);
      setCouponMessage("Cupón 'CACAO10' aplicado: 10% de descuento ✓");
    } else if (couponCode.trim() !== "") {
      setCouponMessage("Cupón inválido. Intente con CACAO10");
      setTimeout(() => setCouponMessage(""), 3000);
    }
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim() || !address.trim() || !city.trim()) {
      setFormError("Por favor derrame todos los campos de envío requeridos.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Por favor ingrese un correo electrónico válido conteniendo '@'.");
      return;
    }

    // Call place order with completed params
    onPlaceOrder(
      { name, email, address, city },
      discountPercent
    );

    // Reset checkout form and close state
    setName("");
    setEmail("");
    setAddress("");
    setIsCheckingOut(false);
  };

  return (
    <div className="fixed inset-0 z-55 overflow-hidden select-none">
      
      {/* Drawer Overlay */}
      <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white flex flex-col justify-between shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] border-l-4 border-black">
          
          {/* Header */}
          <div className="p-6 border-b-4 border-black flex items-center justify-between bg-white">
            <h2 className="text-xs font-black tracking-widest uppercase text-black flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-black stroke-[2.5]" /> BOLSA DE COMPRAS ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-black transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-neutral-50 flex items-center justify-center mb-4 border-2 border-black">
                  <ShoppingBag className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Tu bolsa de compras está vacía</h3>
                <p className="mt-1 text-xs text-neutral-400 font-bold max-w-[200px] uppercase">
                  Explora y agrega prendas de alto rendimiento a tu colección.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-4 bg-black text-white border-2 border-black hover:bg-white hover:text-black text-xs font-black tracking-widest uppercase"
                >
                  Seguir Comprando
                </button>
              </div>
            ) : !isCheckingOut ? (
              /* Item list views */
              <div className="flex flex-col gap-6">
                
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b-2 border-neutral-100 pb-5 items-start">
                    
                    {/* Thumbnail preview */}
                    <div className="relative w-20 h-24 bg-neutral-50 shrink-0 border-2 border-black">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta description */}
                    <div className="flex-1 flex flex-col justify-between h-24">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-xs font-black text-black line-clamp-1 uppercase tracking-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-neutral-300 hover:text-black transition-all"
                            title="Descartar item"
                          >
                            <Trash2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          </button>
                        </div>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1 tracking-wider">
                          TALLA: <span className="font-black text-black bg-neutral-100 border border-neutral-200 px-1">{item.selectedSize}</span> | COLOR: <span className="text-black font-black">{item.selectedColor}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Qty edit buttons */}
                        <div className="flex border-2 border-black h-8 w-24 shrink-0 bg-white">
                          <button
                            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                            className="w-7 text-xs font-black text-black hover:bg-neutral-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="flex-1 flex items-center justify-center font-black text-[11px] text-black select-none bg-neutral-100 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.product.stock && item.product.stock[`${item.selectedSize}-${item.selectedColor}`] !== undefined && item.quantity >= item.product.stock[`${item.selectedSize}-${item.selectedColor}`]}
                            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                            className="w-7 text-xs font-black text-black hover:bg-neutral-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        {/* Line total price */}
                        <span className="text-xs font-black text-black font-mono">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}

                {/* Promo Coupon Applicator */}
                <div className="pt-4 border-t-2 border-black/10">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CÓDIGO CUPÓN (CACAO10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 uppercase bg-neutral-50 border-2 border-black text-xs px-3.5 py-3.5 focus:outline-none focus:bg-white placeholder-neutral-400 font-black tracking-widest"
                    />
                    <button
                      type="submit"
                      className="px-5 bg-black border-2 border-black hover:bg-white hover:text-black text-white text-[11px] font-black tracking-widest uppercase transition-colors"
                    >
                      APLICAR
                    </button>
                  </form>
                  {couponMessage && (
                    <p className={`text-[9px] mt-2 font-black uppercase tracking-wider ${discountPercent > 0 ? "text-green-600" : "text-amber-600"}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

              </div>
            ) : (
              /* Checkout Form Panel */
              <div className="flex flex-col gap-5">
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="text-[9px] font-black text-neutral-400 hover:text-black self-start uppercase flex items-center gap-1"
                >
                  ← VOLVER A LA BOLSA
                </button>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-black stroke-[2.5]" /> DATOS DE ENVÍO EXPRESS
                  </h3>
                  <p className="text-[9px] text-neutral-400 mt-1 uppercase font-bold tracking-wider">
                    EMBALAJE PREMIUM MÁXIMO CON ENTREGA RÁPIDA.
                  </p>
                </div>

                <form onSubmit={handleSubmitCheckout} className="flex flex-col gap-4">
                  {formError && (
                    <div className="p-3 bg-red-100 text-red-900 text-[10px] font-black border-2 border-black flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 stroke-[2.5]" /> {formError}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black">NOMBRE COMPLETO</label>
                    <input
                      type="text"
                      required
                      placeholder="SOFÍA MONTENEGRO LÓPEZ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="outline-none bg-neutral-50 border-2 border-black text-xs px-3 py-3 focus:bg-white font-black text-black uppercase tracking-wider"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black">CORREO ELECTRÓNICO</label>
                    <input
                      type="email"
                      required
                      placeholder="SOFIA.MONTENEGRO@GMAIL.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="outline-none bg-neutral-50 border-2 border-black text-xs px-3 py-3 focus:bg-white font-black text-black uppercase tracking-wider"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black">DIRECCIÓN DE ENTREGA</label>
                    <input
                      type="text"
                      required
                      placeholder="CALLE PRINCIPAL #45-12, APTO 402"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="outline-none bg-neutral-50 border-2 border-black text-xs px-3 py-3 focus:bg-white font-black text-black uppercase tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black">CIUDAD</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="outline-none bg-neutral-50 border-2 border-black text-xs px-3 py-3 focus:bg-white font-black text-black uppercase tracking-wider"
                      >
                        <option value="Bogotá">Bogotá</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black">PAÍS</label>
                      <input
                        type="text"
                        disabled
                        value="Colombia"
                        className="outline-none bg-neutral-100 border border-neutral-300 text-xs px-3 py-3 font-black text-neutral-400 select-none uppercase tracking-wider"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 w-full h-12 bg-black border-2 border-black hover:bg-white hover:text-black text-white text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 stroke-[2.5]" /> AUTORIZAR ENVÍO Y PEDIDO
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Billing Summary Totals summary (Always visible except when empty) */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-neutral-50 border-t-2 border-neutral-200 flex flex-col gap-3 font-mono">
              <div className="flex justify-between text-xs font-semibold text-neutral-500 uppercase">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-xs font-black text-green-600 uppercase">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="w-4 h-4 stroke-[2.5]" /> Descuento (10%)
                  </span>
                  <span>-{formatPrice(rawDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-semibold text-neutral-500 uppercase">
                <span>Costo de Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
              </div>

              {shippingCost > 0 && (
                <p className="text-[9px] text-neutral-400 tracking-wider text-right uppercase font-bold">
                  * Agregue {formatPrice(80000 - subtotal)} más para obtener envío gratis
                </p>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-between font-sans">
                <span className="text-xs font-black text-black uppercase tracking-widest">Monto Total</span>
                <span className="text-lg font-black text-black bg-neutral-100 border border-black px-2 py-0.5">{formatPrice(total)}</span>
              </div>

              {!isCheckingOut && (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="mt-4 w-full h-12 bg-black border-2 border-black hover:bg-white hover:text-black text-white text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 stroke-[2.5]" /> CONTINUAR AL ENVÍO
                </button>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
