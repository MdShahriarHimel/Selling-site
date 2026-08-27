/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCategory =
  | 'all'
  | 'design'
  | 'productivity'
  | 'streaming'
  | 'development'
  | 'ai'
  | 'video'
  | 'utility';

export type ProductBadge = 'hot' | 'new' | 'popular' | 'lifetime' | '';

export interface Product {
  id: number;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  badge: ProductBadge;
  category: ProductCategory;
  iconName: string;
  shortDesc: string;
  description: string;
  features: string[];
  deliveryType: 'Instant Automated' | 'Panel Invite' | 'License Key';
  warranty: string;
  stockCount: number;
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedDuration?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  duration: string;
  price: number;
  qty: number;
  licenseKey: string;
}

export interface OrderReceipt {
  orderId: string;
  createdAt: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'Completed' | 'Delivered';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
}
