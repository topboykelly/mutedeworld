"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { colorNames, stockFor, type Product } from "./product";

const STORAGE_KEY = "mdw_cart";

type StoredLine = { productId: string; color: string; size: string; qty: number };

export type CartLine = StoredLine & {
  key: string;
  product: Product;
  /** Units in stock for this variant. 0 means it sold out after being added. */
  available: number;
  lineTotal: number;
};

const lineKey = (productId: string, color: string, size: string) => `${productId}|${color}|${size}`;
const keyOf = (l: StoredLine) => lineKey(l.productId, l.color, l.size);

/* ── localStorage-backed store, read through useSyncExternalStore so SSR and hydration agree ── */

const EMPTY: StoredLine[] = [];
let lines: StoredLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isStoredLine(value: unknown): value is StoredLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.color === "string" &&
    typeof line.size === "string" &&
    typeof line.qty === "number" &&
    Number.isInteger(line.qty) &&
    line.qty > 0
  );
}

function load() {
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    lines = Array.isArray(parsed) ? parsed.filter(isStoredLine) : EMPTY;
  } catch {
    lines = EMPTY;
  }
}

function getSnapshot() {
  if (!loaded) load();
  return lines;
}

const getServerSnapshot = () => EMPTY;

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setLines(next: StoredLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

/* ── React context ── */

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** Total of lines that are still in stock. */
  subtotal: number;
  /** True when a line sold out after it was added and must be removed before checkout. */
  hasUnavailable: boolean;
  /** Adds up to `qty` units, capped by stock. Returns how many were added. */
  addItem: (productId: string, color: string, size: string, qty?: number) => number;
  qtyInCart: (productId: string, color: string, size: string) => number;
  updateQty: (key: string, qty: number) => void;
  updateVariant: (key: string, color: string, size: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartLines = useMemo<CartLine[]>(
    () =>
      stored.flatMap((line) => {
        const product = byId.get(line.productId);
        if (!product || !product.sizes.includes(line.size) || !colorNames(product).includes(line.color)) return [];
        const available = stockFor(product, line.color, line.size);
        const qty = available > 0 ? Math.min(line.qty, available) : line.qty;
        return [{ ...line, qty, key: keyOf(line), product, available, lineTotal: available > 0 ? product.price * qty : 0 }];
      }),
    [stored, byId],
  );

  const availableFor = useCallback(
    (productId: string, color: string, size: string) => {
      const product = byId.get(productId);
      return product ? stockFor(product, color, size) : 0;
    },
    [byId],
  );

  const addItem = useCallback(
    (productId: string, color: string, size: string, qty = 1) => {
      const key = lineKey(productId, color, size);
      const current = getSnapshot();
      const existing = current.find((l) => keyOf(l) === key);
      const room = availableFor(productId, color, size) - (existing?.qty ?? 0);
      const added = Math.max(0, Math.min(qty, room));
      if (added === 0) return 0;
      setLines(
        existing
          ? current.map((l) => (l === existing ? { ...l, qty: l.qty + added } : l))
          : [...current, { productId, color, size, qty: added }],
      );
      return added;
    },
    [availableFor],
  );

  const qtyInCart = useCallback(
    (productId: string, color: string, size: string) =>
      cartLines.find((l) => l.key === lineKey(productId, color, size))?.qty ?? 0,
    [cartLines],
  );

  const updateQty = useCallback(
    (key: string, qty: number) => {
      setLines(
        getSnapshot().map((l) => {
          if (keyOf(l) !== key) return l;
          const max = Math.max(1, availableFor(l.productId, l.color, l.size));
          return { ...l, qty: Math.min(max, Math.max(1, qty)) };
        }),
      );
    },
    [availableFor],
  );

  const updateVariant = useCallback(
    (key: string, color: string, size: string) => {
      const current = getSnapshot();
      const line = current.find((l) => keyOf(l) === key);
      if (!line || (line.color === color && line.size === size)) return;
      const targetKey = lineKey(line.productId, color, size);
      const target = current.find((l) => keyOf(l) === targetKey);
      const max = availableFor(line.productId, color, size);
      if (max === 0) return;
      const qty = Math.min(max, line.qty + (target?.qty ?? 0));
      const rest = current.filter((l) => l !== line && l !== target);
      const index = current.indexOf(line);
      rest.splice(Math.min(index, rest.length), 0, { ...line, color, size, qty });
      setLines(rest);
    },
    [availableFor],
  );

  const removeItem = useCallback((key: string) => {
    setLines(getSnapshot().filter((l) => keyOf(l) !== key));
  }, []);

  const clear = useCallback(() => setLines(EMPTY), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: cartLines,
      count: cartLines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: cartLines.reduce((sum, l) => sum + l.lineTotal, 0),
      hasUnavailable: cartLines.some((l) => l.available === 0),
      addItem,
      qtyInCart,
      updateQty,
      updateVariant,
      removeItem,
      clear,
      isOpen,
      openCart,
      closeCart,
    }),
    [cartLines, addItem, qtyInCart, updateQty, updateVariant, removeItem, clear, isOpen, openCart, closeCart],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
