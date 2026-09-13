export type ProductCategory =
  | 'chocolate-bar'
  | 'praline-snack'
  | 'chocolate-drink'
  | 'cocoa-ingredients'
  | 'ball-choco'
  | 'rendang';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  unit?: string;
  weight?: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}