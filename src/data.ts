import { Product, Order } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Short de Compresión Carbono",
    price: 45000,
    description: "Soporte muscular avanzado y libertad de movimiento total. Fabricado con fibras de compresión ultraligeras y costuras planas antirozaduras para un rendimiento óptimo en carrera y levantamiento.",
    category: "Shorts",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Negro Obsidiana", "Gris Carbón"],
    mainImage: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 124,
    isFeatured: true,
    isNew: true,
    specifications: [
      "78% Poliéster Reciclado, 22% Elastano",
      "Bolsillo lateral oculto para móvil",
      "Banda de silicona antideslizante en muslos",
      "Tejido transpirable de secado rápido"
    ]
  },
  {
    id: "prod-2",
    name: "Short Técnico Aero-Split",
    price: 39000,
    description: "Diseñado para velocidad extrema. Chasis de secado ultra-rápido, aperturas laterales dinámicas para zancadas extra-largas e interior de malla suspendida suave y transpirable.",
    category: "Shorts",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    colorOptions: ["Blanco Óptico", "Gris Plata", "Negro Obsidiana"],
    mainImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.6,
    reviewsCount: 88,
    isFeatured: false,
    specifications: [
      "Tejido ultraligero ripstop microperforado",
      "Detalles reflectantes impresos en 3M",
      "Cordón deportivo interno regulable",
      "Bolsillo posterior con cremallera termosellada"
    ]
  },
  {
    id: "prod-3",
    name: "Camiseta AeroTech Microperforada",
    price: 32000,
    description: "Ventilación activa constante. Diseñada con un entramado microperforado por ordenador colocado estratégicamente en las zonas de mayor calor corporal para una evaporación inmediata.",
    category: "Camisas",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    colorOptions: ["Gris Plata", "Blanco Óptico", "Negro Obsidiana"],
    mainImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 215,
    isFeatured: true,
    isNew: true,
    specifications: [
      "100% Microfibra de Poliéster Técnico",
      "Tratamiento hidrófugo hidrofílico dual",
      "Ajuste atlético contorneado",
      "Costuras de hilo sedoso anti-fricción"
    ]
  },
  {
    id: "prod-4",
    name: "Playera Apex Compression LS",
    price: 42000,
    description: "Manga larga de alta compresión que mejora la propiocepción y acelera la recuperación post-entrenamiento. Su mapeo muscular sostiene el torso y reduce las oscilaciones de impacto.",
    category: "Camisas",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Negro Obsidiana", "Gris Carbón"],
    mainImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewsCount: 142,
    isFeatured: true,
    specifications: [
      "85% Nylon de alta densidad, 15% Spandex",
      "Manga sastre con ajuste de pulgar ergonómico",
      "Tratamiento bactericida de iones de plata",
      "Protección solar certificada UPF 50+"
    ]
  },
  {
    id: "prod-5",
    name: "Leggings Esculpidos Core Pro",
    price: 55000,
    description: "Compresión moldeadora premium. Cintura alta estabilizadora con costuras en V traseras para crear un efecto estilizado. Diseñado para soportar entrenamientos de máxima intensidad sin moverse ni deslizarse.",
    category: "Leggins",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    colorOptions: ["Negro Obsidiana", "Gris Carbón"],
    mainImage: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 341,
    isFeatured: true,
    isNew: true,
    specifications: [
      "Tejido entrelazado premium de triple torsión",
      "Opacidad 100% garantizada (Squat-Proof)",
      "Banda de compresión abdominal de doble capa",
      "Bolsillo invisible integrado en cinturilla"
    ]
  },
  {
    id: "prod-6",
    name: "Leggings AeroFlow Studio G3",
    price: 49000,
    description: "Súper suave y transpirable para tus rutinas de yoga, barra o pilates. Diseñado con hilos de tacto de mantequilla que reducen las distracciones corporales y se sienten como una segunda piel.",
    category: "Leggins",
    sizeOptions: ["XS", "S", "M", "L"],
    colorOptions: ["Gris Plata", "Negro Obsidiana"],
    mainImage: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.5,
    reviewsCount: 76,
    isFeatured: false,
    specifications: [
      "80% Poliamida ultra suave, 20% Elastano sedoso",
      "Longitud 7/8 tobillera perfecta",
      "Ausencia de costuras frontales para máxima comodidad",
      "Absorción inmediata de sudor"
    ]
  },
  {
    id: "prod-7",
    name: "Cortavientos Apex Shield Pro",
    price: 89000,
    description: "Protección climática sin precedentes. Un escudo impenetrable contra viento y llovizna con ventilaciones mecánicas ocultas y un peso menor de 150 gramos. Ajuste deportivo de alta costura.",
    category: "Chaquetas",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    colorOptions: ["Negro Obsidiana", "Gris Plata"],
    mainImage: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 95,
    isFeatured: true,
    isNew: true,
    specifications: [
      "Nylon ripstop microporoso siliconado",
      "Membrana resistente al agua DWR",
      "Bolsillo de pecho auto-empacable para plegado total",
      "Ajustes elásticos de bajo perfil en muñecas y capucha"
    ]
  },
  {
    id: "prod-8",
    name: "Chaqueta Térmica Merino Hybrid",
    price: 110000,
    description: "La fusión perfecta de calidez reguladora de lana merino real en pecho y espalda, combinada con mangas elásticas repelentes al viento. Ideal para deportes alpinos, trail running gélido o uso urbano sobrio.",
    category: "Chaquetas",
    sizeOptions: ["M", "L", "XL"],
    colorOptions: ["Gris Carbón", "Negro Obsidiana"],
    mainImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewsCount: 52,
    isFeatured: false,
    specifications: [
      "Paneles frontales acolchados eco-sostenibles",
      "Lana merino ultra-fina antibacteriana nativa",
      "Bolsillos calefactores para manos con cremallera",
      "Cremallera bidireccional YKK Vislon de alta resistencia"
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "CACAO-1084",
    trackerCode: "CACAO-TRK-741a",
    items: [
      {
        id: "prod-1-M-Negro Obsidiana",
        product: PRODUCTS[0],
        quantity: 1,
        selectedSize: "M",
        selectedColor: "Negro Obsidiana"
      },
      {
        id: "prod-5-S-Gris Carbón",
        product: PRODUCTS[4],
        quantity: 1,
        selectedSize: "S",
        selectedColor: "Gris Carbón"
      }
    ],
    subtotal: 100000,
    shippingCost: 8000,
    total: 108000,
    status: "en_camino",
    date: "2026-05-22",
    estimatedDelivery: "24 de Mayo, 2026",
    customerName: "Sofía Montenegro López",
    customerEmail: "sofia.montenegro@gmail.com",
    customerAddress: "Calle Principal #45-12, Apto 402, Edificio Alborada",
    customerCity: "Bogotá",
    timeline: [
      {
        status: "confirmado",
        label: "Pedido Confirmado",
        description: "Hemos recibido tu pedido de forma segura en nuestros servidores.",
        time: "22 May 2026, 09:30 AM",
        completed: true
      },
      {
        status: "preparacion",
        label: "Preparación de Paquete",
        description: "Tus prendas seleccionadas han sido seleccionadas, probadas y empaquetadas en nuestra caja minimalista reciclable.",
        time: "22 May 2026, 03:15 PM",
        completed: true
      },
      {
        status: "en_camino",
        label: "En Camino / Tránsito",
        description: "El paquete fue entregado al courier en bodega central norte. Se encuentra en ruta de distribución.",
        time: "23 May 2026, 08:00 AM",
        completed: true
      },
      {
        status: "entregado",
        label: "Entregado",
        description: "El courier de confianza entregará en tu puerta principal.",
        time: "Estimado, 24 May 2026",
        completed: false
      }
    ]
  }
];
