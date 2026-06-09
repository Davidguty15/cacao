import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Clock, Check, Truck, Award, ShoppingBag, Send, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderTrackerProps {
  orders: Order[];
  onSimulateStageUpdate?: (orderId: string, currentStatus: OrderStatus) => void;
  onResetOrderSimulation?: (orderId: string) => void;
  searchedOrderCode?: string | null;
}

export default function OrderTracker({
  orders,
  onSimulateStageUpdate,
  onResetOrderSimulation,
  searchedOrderCode,
}: OrderTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState("");

  // Sync searchedOrderCode from parents
  useEffect(() => {
    if (searchedOrderCode) {
      const match = orders.find(
        (o) =>
          o.id.toLowerCase() === searchedOrderCode.toLowerCase() ||
          o.trackerCode.toLowerCase() === searchedOrderCode.toLowerCase()
      );
      if (match) {
        setActiveOrder(match);
        setSearchQuery(match.id);
        setSearchError("");
      }
    }
  }, [searchedOrderCode, orders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    if (!searchQuery.trim()) {
      setSearchError("Por favor ingrese un código de pedido.");
      return;
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanQuery ||
        o.trackerCode.toLowerCase() === cleanQuery ||
        o.id.toLowerCase().replace("cacao-", "") === cleanQuery
    );

    if (found) {
      setActiveOrder(found);
      setSearchError("");
    } else {
      setActiveOrder(null);
      setSearchError("No encontramos ningún pedido con este código. Pruebe con 'CACAO-1084'");
    }
  };

  const handleQuickTrack = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setActiveOrder(found);
      setSearchQuery(found.id);
      setSearchError("");
    }
  };

  const handleSimulateNext = () => {
    if (!activeOrder || !onSimulateStageUpdate) return;
    
    // Determine what the next stage is
    const currentStatus = activeOrder.status;
    onSimulateStageUpdate(activeOrder.id, currentStatus);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">// LOCALIZACIÓN REAL</span>
        <h2 className="text-3xl font-black text-black tracking-tighter uppercase mt-1">
          SEGUIMIENTO DE PEDIDOS
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wider max-w-md mx-auto">
          ¿Realizaste un pedido? Revisa el estado de procesamiento y despacho al instante con nuestro sistema de geolocalización.
        </p>
      </div>

      {/* Search Console Input */}
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black stroke-[3]" />
            <input
              type="text"
              placeholder="EJ: CACAO-1084 O CÓDIGO DE SEGUIMIENTO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 px-10 py-4 border-2 border-black text-xs text-black font-black focus:outline-none focus:bg-white uppercase placeholder-neutral-400 tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-black border-2 border-black hover:bg-white hover:text-black text-white text-xs font-black tracking-widest uppercase transition-all duration-200 cursor-pointer"
          >
            BUSCAR PEDIDO
          </button>
        </form>

        {searchError && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs font-black uppercase text-red-600">
            <AlertCircle className="w-4 h-4 stroke-[2.5]" /> {searchError}
          </div>
        )}

        {/* Quick selection shortcuts for testing purposes */}
        <div className="mt-5 pt-4 border-t-2 border-neutral-100 flex flex-wrap items-center gap-3">
          <span className="text-[9px] font-black text-black uppercase tracking-widest">PEDIDOS PARA PRUEBAS:</span>
          {orders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => handleQuickTrack(ord.id)}
              className={`text-[9px] font-black px-3.5 py-2 border-2 transition-all ${
                activeOrder && activeOrder.id === ord.id
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-neutral-100 text-black border-black"
              }`}
            >
              # {ord.id} ({ord.customerName.split(" ")[0].toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Main Tracker details layout */}
      {activeOrder ? (
        <div className="flex flex-col gap-6">
          
          {/* Interactive Simulation Console */}
          {onSimulateStageUpdate && (
            <div className="bg-neutral-950 text-white p-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest mb-1">
                  <Zap className="w-3 h-3 fill-current" /> MODO SIMULADOR ACTIVO
                </span>
                <p className="text-[11px] text-neutral-300 font-bold uppercase tracking-wider">
                  Prueba la fluidez y los avisos interactivos del sistema en tiempo real.
                </p>
              </div>
              <div className="flex gap-2.5">
                {activeOrder.status !== "entregado" ? (
                  <button
                    onClick={handleSimulateNext}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-white border-2 border-yellow-400 hover:border-black hover:text-black text-black text-[10px] font-black tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
                  >
                    <span>AVANZAR ESTADO ⚡</span>
                  </button>
                ) : (
                  <span className="bg-neutral-900 border border-neutral-700 text-green-400 text-[10px] font-black uppercase px-3 py-2 flex items-center gap-1">
                    ✓ ENTREGA COMPLETADA
                  </span>
                )}
                <button
                  onClick={() => onResetOrderSimulation && onResetOrderSimulation(activeOrder.id)}
                  className="p-2 border-2 border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Reiniciar simulación"
                >
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* Core Status Summary */}
          <div className="bg-white border-4 border-black p-6 flex flex-col md:flex-row justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">PEDIDO ACTUAL</span>
                <span className="text-xs font-black text-black font-mono bg-neutral-100 px-2 py-0.5 border border-black">#{activeOrder.id}</span>
              </div>
              <h3 className="mt-2 text-xl font-black text-black uppercase tracking-tight">
                {activeOrder.status === "confirmado" && "Pedido Confirmado / Pendiente"}
                {activeOrder.status === "preparacion" && "Preparando tu envío"}
                {activeOrder.status === "en_camino" && "En tránsito de distribución"}
                {activeOrder.status === "entregado" && "¡Completado e Entregado!"}
              </h3>
              <p className="mt-1.5 text-xs text-neutral-600 font-bold uppercase tracking-wider max-w-md">
                {activeOrder.status === "confirmado" && "Hemos confirmado tu pago express exitosamente. El equipo de empaque ya comenzó a procesar."}
                {activeOrder.status === "preparacion" && "Tu indumentaria deportiva está siendo doblada y empacada en nuestra caja ecológica sobria."}
                {activeOrder.status === "en_camino" && "El mensajero de confianza ha retirado el paquete de la central norte y se dirige a tu código postal."}
                {activeOrder.status === "entregado" && "El paquete fue entregado de forma segura en las manos especificadas por el destinatario."}
              </p>
            </div>

            <div className="text-left md:text-right md:border-l-2 md:border-black md:pl-6 flex flex-col justify-center min-w-[200px]">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">ENTREGA ESTIMADA</span>
              <span className="text-base font-black text-black mt-1 font-mono">{activeOrder.estimatedDelivery.toUpperCase()}</span>
              <span className="text-[9px] text-green-600 font-black uppercase mt-1 flex items-center md:justify-end gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> ENVÍO PREMIUM ASEGURADO
              </span>
            </div>
          </div>

          {/* Stepper Timeline visually responsive */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-xs font-black uppercase text-black tracking-widest mb-8">LÍNEA DE VIDA DE TU PAQUETE</h4>
            
            {/* Horizontal timeline on medium screens+, vertical on smaller */}
            <div className="hidden md:flex justify-between relative mb-12">
              <div className="absolute top-4.5 left-4 right-4 h-1 bg-neutral-100 z-0 border-b border-black/10"></div>
              
              {activeOrder.timeline.map((event, i) => {
                const isActive = activeOrder.status === event.status || event.completed;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-9 h-9 flex items-center justify-center transition-all border-2 ${
                        event.completed
                          ? "bg-black text-white border-black"
                          : activeOrder.status === event.status
                          ? "bg-white text-black border-dashed border-black animate-pulse font-black"
                          : "bg-white text-neutral-300 border-neutral-200"
                      }`}
                    >
                      {event.completed ? <Check className="w-4.5 h-4.5 stroke-[3]" /> : <Clock className="w-4 h-4 stroke-[2]" />}
                    </div>
                    <span className="mt-3.5 text-[10px] font-black text-black uppercase tracking-tight">{event.label}</span>
                    <span className="mt-1 text-[9px] font-black text-neutral-400 font-mono tracking-widest">{event.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Vertical timeline for mobile screens */}
            <div className="flex md:hidden flex-col gap-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:bg-black">
              {activeOrder.timeline.map((event, i) => {
                const isActive = activeOrder.status === event.status || event.completed;
                return (
                  <div key={i} className="relative flex flex-col justify-start">
                    
                    {/* Circle marker */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 flex items-center justify-center border-2 ${
                        event.completed
                          ? "bg-black border-black"
                          : activeOrder.status === event.status
                          ? "bg-white border-black"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      {event.completed && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>

                    <div className="flex justify-between items-baseline">
                      <h5 className={`text-xs font-black uppercase ${isActive ? "text-black" : "text-neutral-400"}`}>
                        {event.label}
                      </h5>
                      <span className="text-[9px] font-black text-neutral-400 font-mono tracking-wide">{event.time}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Delivery Coordinates Receipt Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delivery Destinations */}
            <div className="bg-white border-4 border-black p-6 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <h4 className="text-xs font-black uppercase text-black tracking-widest mb-3.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-black stroke-[2.5]" /> COORDENADAS DE ENVÍO
                </h4>
                <div className="flex flex-col gap-2 font-bold uppercase tracking-wide text-neutral-600 text-xs text-[10px]">
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="font-black text-black">DESTINATARIO:</span>
                    <span>{activeOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="font-black text-black">EMAIL:</span>
                    <span className="normal-case">{activeOrder.customerEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="font-black text-black">DIRECCIÓN:</span>
                    <span>{activeOrder.customerAddress}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="font-black text-black">CIUDAD:</span>
                    <span>{activeOrder.customerCity.toUpperCase()}, COLOMBIA</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-neutral-100 flex justify-between text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                <span>COURIER DE REPARTO:</span>
                <span className="text-black">CACAO EXPRESS LOGISTICS</span>
              </div>
            </div>

            {/* Shopping Receipt Summary */}
            <div className="bg-white border-4 border-black p-6 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <h4 className="text-xs font-black uppercase text-black tracking-widest mb-3.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-black stroke-[2.5]" /> DESGLOSE DE COMPRA
                </h4>
                
                <div className="flex flex-col gap-3 max-h-40 overflow-y-auto font-mono">
                  {activeOrder.items.map((item, id) => (
                    <div key={id} className="flex justify-between items-center text-xs text-black font-bold uppercase">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.5 border border-black">{item.quantity}X</span>
                        <span className="uppercase tracking-wide truncate max-w-40">{item.product.name}</span>
                      </div>
                      <span className="font-black font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, Shipping, Total */}
              <div className="mt-6 pt-4 border-t-2 border-neutral-100 flex flex-col gap-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-500 uppercase font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(activeOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 uppercase font-semibold">
                  <span>Envío Express</span>
                  <span>{activeOrder.shippingCost === 0 ? "Gratis" : formatPrice(activeOrder.shippingCost)}</span>
                </div>
                <div className="pt-2 border-t-2 border-black flex justify-between font-black text-xs text-black font-mono uppercase">
                  <span>TOTAL COBRADO</span>
                  <span className="bg-neutral-100 px-1 border border-black">{formatPrice(activeOrder.total)}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Empty states */
        <div className="bg-white border-4 border-black p-12 text-center flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-16 h-16 bg-neutral-50 flex items-center justify-center mb-4 border-2 border-black">
            <Truck className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-black text-black uppercase tracking-wider">Ninguna Consulta Activa</h3>
          <p className="mt-1.5 text-xs text-neutral-500 font-bold uppercase tracking-wider max-w-sm mx-auto">
            Por favor ingresa tu número de pedido en la barra superior o selecciona una de las consultas preestablecidas para ver el seguimiento del paquete.
          </p>
        </div>
      )}

    </div>
  );
}
