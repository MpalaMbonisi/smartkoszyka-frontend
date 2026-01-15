import { Component, inject, signal, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product/product.service';
import { Category, Product } from '../../../core/models/product.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ListSelectorModal } from '../../../shared/components/list-selector-modal/list-selector-modal';
import { ProductSelectionService } from '../../../core/services/product-selection/product-selection-service';

@Component({
  selector: 'app-product-catalog-component',
  imports: [CommonModule, ReactiveFormsModule, ListSelectorModal],
  templateUrl: './product-catalog-component.html',
  styleUrl: './product-catalog-component.scss',
})
export class ProductCatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private productSelectionService = inject(ProductSelectionService);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  showEmptyState = signal(true); // Show message before any filter is applied

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadCategories();
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

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        if (query && query.trim()) {
          this.searchProducts(query.trim());
        }
      });
  }

  private searchProducts(query: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.showEmptyState.set(false);
    this.selectedCategory.set(null);

    this.productService.searchProducts(query).subscribe({
      next: products => {
        this.products.set(products);
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
    if (categoryId === null) {
      this.clearFilters();
      return;
    }

    this.selectedCategory.set(categoryId);
    this.searchControl.setValue('', { emitEvent: false });
    this.showEmptyState.set(false);
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProductsByCategory(categoryId).subscribe({
      next: products => {
        this.products.set(products);
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
    this.products.set([]);
    this.showEmptyState.set(true);
  }

  onProductSelect(product: Product): void {
    this.productSelectionService.selectProduct(product);
  }
}
