import { Injectable, signal } from '@angular/core';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductSelectionService {
  private selectedProduct = signal<Product | null>(null);
  showListSelector = signal(false);

  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.showListSelector.set(true);
  }

  getSelectedProduct(): Product | null {
    return this.selectedProduct();
  }

  clearSelection(): void {
    this.selectedProduct.set(null);
    this.showListSelector.set(false);
  }
}
