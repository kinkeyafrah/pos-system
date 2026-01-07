
import { Product, UnitOfMeasure } from './types';

export const CATEGORIES = [
  "All",
  "Produce",
  "Dairy & Eggs",
  "Bakery",
  "Meat & Seafood",
  "Pantry",
  "Beverages",
  "Frozen",
  "Household"
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Bananas', category: 'Produce', price: 1.99, uom: UnitOfMeasure.KG, stock: 75, lowStockThreshold: 10, barcode: '4011', image: 'https://picsum.photos/seed/banana/200', color: 'bg-yellow-100' },
  { id: '2', name: 'Red Apples', category: 'Produce', price: 2.99, uom: UnitOfMeasure.KG, stock: 40, lowStockThreshold: 10, barcode: '4015', image: 'https://picsum.photos/seed/apple/200', color: 'bg-red-100' },
  { id: '3', name: 'Whole Milk 1Gal', category: 'Dairy & Eggs', price: 4.29, uom: UnitOfMeasure.EACH, stock: 42, lowStockThreshold: 10, expiryDate: '2024-06-15', barcode: '10001', image: 'https://picsum.photos/seed/milk/200', color: 'bg-blue-100' },
  { id: '4', name: 'Sourdough Bread', category: 'Bakery', price: 5.50, uom: UnitOfMeasure.EACH, stock: 12, lowStockThreshold: 5, expiryDate: '2024-05-20', barcode: '20002', image: 'https://picsum.photos/seed/bread/200', color: 'bg-orange-100' },
  { id: '5', name: 'Ribeye Steak', category: 'Meat & Seafood', price: 39.99, uom: UnitOfMeasure.KG, stock: 10, lowStockThreshold: 3, expiryDate: '2024-05-22', barcode: '30003', image: 'https://picsum.photos/seed/steak/200', color: 'bg-rose-100' },
  { id: '6', name: 'Greek Yogurt', category: 'Dairy & Eggs', price: 1.25, uom: UnitOfMeasure.EACH, stock: 60, lowStockThreshold: 15, barcode: '10004', image: 'https://picsum.photos/seed/yogurt/200', color: 'bg-cyan-100' },
  { id: '7', name: 'Organic Spinach', category: 'Produce', price: 3.99, uom: UnitOfMeasure.BUNDLE, stock: 24, lowStockThreshold: 8, barcode: '4022', image: 'https://picsum.photos/seed/spinach/200', color: 'bg-emerald-100' },
  { id: '8', name: 'Avocado', category: 'Produce', price: 1.50, uom: UnitOfMeasure.EACH, stock: 45, lowStockThreshold: 10, barcode: '4046', image: 'https://picsum.photos/seed/avocado/200', color: 'bg-green-100' },
  { id: '9', name: 'Bottled Water 24pk', category: 'Beverages', price: 6.99, uom: UnitOfMeasure.CASE, stock: 30, lowStockThreshold: 10, barcode: '50005', image: 'https://picsum.photos/seed/water/200', color: 'bg-blue-50' },
  { id: '10', name: 'Paper Towels', category: 'Household', price: 12.49, uom: UnitOfMeasure.CASE, stock: 18, lowStockThreshold: 5, barcode: '60006', image: 'https://picsum.photos/seed/paper/200', color: 'bg-slate-100' },
];
