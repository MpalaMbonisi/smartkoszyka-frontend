import { Component, inject, signal, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product/product.service';
import { Category, Product } from '../../../core/models/product.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-catalog-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-catalog-component.html',
  styleUrl: './product-catalog-component.scss',
})
export class ProductCatalogComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.setupSearch();
  }

  private loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: categories => this.categories.set(categories),
      error: error => {
        console.error('Failed to load categories:', error);
      },
    });
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getAllProducts().subscribe({
      next: products => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
        console.error('Failed to load products:', error);
      },
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        if (query && query.trim()) {
          this.searchProducts(query.trim());
        } else {
          this.filterByCategory(this.selectedCategory());
        }
      });
  }

  private searchProducts(query: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.searchProducts(query).subscribe({
      next: products => {
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Search failed. Please try again.');
        this.isLoading.set(false);
        console.error('Search failed:', error);
      },
    });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.searchControl.setValue('', { emitEvent: false });

    if (categoryId === null) {
      this.filteredProducts.set(this.products());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProductsByCategory(categoryId).subscribe({
      next: products => {
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to filter products. Please try again.');
        this.isLoading.set(false);
        console.error('Failed to filter products:', error);
      },
    });
  }

  clearFilters(): void {
    this.selectedCategory.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.filteredProducts.set(this.products());
  }

  onProductSelect(product: Product): void {
    // TODO: This will be implemented when shopping list is ready for integration
    console.log('Product selected:', product);
  }
}
