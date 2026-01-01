export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
