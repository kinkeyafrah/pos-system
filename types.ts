
export enum UnitOfMeasure {
  KG = 'kg',
  EACH = 'each',
  CASE = 'case',
  BUNDLE = 'bundle'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  uom: UnitOfMeasure;
  stock: number;
  lowStockThreshold: number;
  expiryDate?: string;
  barcode: string;
  image?: string;
  color?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  weight?: number; // for kg
  discount?: number;
}

export interface Transaction {
  id:string;
  timestamp: string;
  items: CartItem[];
  total: number;
  tax: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'loyalty';
  cashierId: string;
}

export interface User {
  id: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
  pin: string;
}

export type ViewType = 'pos' | 'inventory' | 'dashboard' | 'users' | 'settings';

export interface AppConfig {
  storeName: string;
  storeLogo?: string;
  currencySymbol: string;
  taxRate: number; // Stored as a decimal, e.g., 0.08 for 8%
  contactPhone: string;
  receiptFooterMessage: string;
}
