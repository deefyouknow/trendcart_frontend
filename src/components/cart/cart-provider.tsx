"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { StoreMerchantLink, Variant } from "@/lib/types";

export interface CartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  merchantLinkId: string;
  platform: string;
  storeName: string;
  variant: Variant;
  affiliateUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { variant: Variant }) => void;
  removeItem: (merchantLinkId: string, variantId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "trendcart-cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      storeCart(items);
    }
  }, [items, mounted]);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id"> & { variant: Variant }) => {
      setItems((prev) => {
        // Check if same merchant link + variant already exists
        const existing = prev.find(
          (item) =>
            item.merchantLinkId === newItem.merchantLinkId &&
            item.variant.id === newItem.variant.id
        );
        if (existing) return prev;

        return [...prev, newItem as CartItem];
      });
    },
    []
  );

  const removeItem = useCallback((merchantLinkId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.merchantLinkId === merchantLinkId && item.variant.id === variantId)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
