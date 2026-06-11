export type ProductCategory = "Shorts" | "Camisas" | "Leggins" | "Chaquetas";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Talla Única";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: ProductCategory;
  sizeOptions: ProductSize[];
  colorOptions: string[];
  stock: Record<string, number>; // key: `${size}-${color}` => quantity
  mainImage: string;
  galleryImages: string[];
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  specifications?: string[];
}

export interface CartItem {
  id: string; // Dynamic combination: `${productId}-${selectedSize}-${selectedColor}`
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
  selectedColor: string;
}

export type OrderStatus = "confirmado" | "preparacion" | "en_camino" | "entregado";

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string;
  trackerCode: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  date: string;
  estimatedDelivery: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  timeline: OrderTimelineEvent[];
}

export interface FiltersState {
  category: ProductCategory | "All";
  sizes: ProductSize[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  isPriceFilterActive?: boolean;
  sortBy: "featured" | "priceAsc" | "priceDesc" | "rating";
}
