export type ProductCategory =
  | 'chocolate-bar'
  | 'praline-snack'
  | 'chocolate-drink'
  | 'cocoa-ingredients'
  | 'ball-choco'
  | 'rendang';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  unit?: string;
  weight?: string;
  description: string;
  imageUrl: string;
  /** Galeri gambar produk (maks. 3). Elemen pertama adalah foto utama/cover. */
  images?: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}