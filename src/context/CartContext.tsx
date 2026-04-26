/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '../types';

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  toast: { message: string; visible: boolean };
  addToast: (message: string) => void;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('terroir-cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [toast, setToast] = useState({ message: '', visible: false });

  useEffect(() => {
    localStorage.setItem('terroir-cart', JSON.stringify(items));
  }, [items]);

  const addToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity, 
        unitPrice: product.price 
      }];
    });
    addToast(`${product.name} ajouté au panier !`);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => 
      prev.map((i) => i.productId === productId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, toast, addToast, hideToast }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
