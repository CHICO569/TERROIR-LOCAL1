/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export enum OrderStatus {
  PENDING = 'en attente',
  SHIPPED = 'expédié',
  DELIVERED = 'livré',
  PAID = 'payé',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  producer: string;
  attributes: Record<string, any>;
  imageUrl: string;
  description: string;
  createdAt?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
}

export type ShippingMethod = 'standard' | 'express' | 'pickup';

export interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  neighborhood: string;
  shippingMethod: ShippingMethod;
  instructions?: string;
}

export interface Order {
  id: string;
  total_amount: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  shipping_method: string;
  instructions?: string;
  payment_method: string;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
}
