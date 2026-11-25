export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'MOBILE_MONEY' | 'CASH';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string | null;
  category?: Category | null;
  createdAt?: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: string;
  addressDetail: string | null;
  paymentMethod: PaymentMethod;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryZoneOption {
  zone: string;
  fee: number;
}
