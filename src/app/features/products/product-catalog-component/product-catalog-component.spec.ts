import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProductCatalogComponent } from './product-catalog-component';
import { Category, Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Pomidory',
      price: 5.99,
      unit: 'kg',
      imageUrl: 'https://example.com/pomidory.jpg',
      brand: 'Biedronka',
      categoryId: 1,
      categoryName: 'Warzywa',
      createdAt: '2026-01-01T10:00:00',
      updatedAt: '2026-01-01T10:00:00',
    },
    {
      id: 2,
      name: 'Banany',
      price: 4.99,
      unit: 'kg',
      imageUrl: 'https://example.com/banan.jpg',
      brand: 'Tropical',
      categoryId: 2,
      categoryName: 'Owoce',
      createdAt: '2026-01-01T11:00:00',
      updatedAt: '2026-01-01T11:00:00',
    },
  ];

  const mockCategories: Category[] = [
    {
      id: 1,
      name: 'Warzywa',
      description: 'Fresh vegetables',
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
    },
    {
      id: 2,
      name: 'Owoce',
      description: 'Fresh fruits',
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
    },
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts',
      'getAllCategories',
      'searchProducts',
      'getProductsByCategory',
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent, ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: productServiceSpy }],
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load products on init', () => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));

      fixture.detectChanges();

      expect(productService.getAllProducts).toHaveBeenCalled();
      expect(component.products()).toEqual(mockProducts);
      expect(component.filteredProducts()).toEqual(mockProducts);
    });

    it('should load categories on init', () => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));

      fixture.detectChanges();

      expect(productService.getAllCategories).toHaveBeenCalled();
      expect(component.categories()).toEqual(mockCategories);
    });

    it('should set loading state while fetching products', () => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));

      expect(component.isLoading()).toBe(false);

      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
    });

    it('should handle error when loading products fails', () => {
      const error = new Error('Failed to load');
      productService.getAllProducts.and.returnValue(throwError(() => error));
      productService.getAllCategories.and.returnValue(of(mockCategories));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Failed to load products. Please try again.');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle error when loading categories fails', () => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(throwError(() => new Error('Failed')));

      spyOn(console, 'error');
      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      fixture.detectChanges();
    });

    it('should search products with debounce', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('pomidor');
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('pomidor');
      expect(component.filteredProducts()).toEqual([mockProducts[0]]);
    }));

    it('should not search with empty query', fakeAsync(() => {
      component.searchControl.setValue('   ');
      tick(300);

      expect(productService.searchProducts).not.toHaveBeenCalled();
    }));

    it('should trim search query', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('  pomidor  ');
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('pomidor');
    }));

    it('should handle search error', fakeAsync(() => {
      const error = new Error('Search failed');
      productService.searchProducts.and.returnValue(throwError(() => error));

      component.searchControl.setValue('pomidor');
      tick(300);

      expect(component.errorMessage()).toBe('Search failed. Please try again.');
      expect(component.isLoading()).toBe(false);
    }));

    it('should not trigger duplicate searches', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('pomidor');
      tick(150);
      component.searchControl.setValue('pomidor');
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledTimes(1);
    }));

    it('should clear error message before new search', fakeAsync(() => {
      component.errorMessage.set('Previous error');
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('pomidor');
      tick(300);

      expect(component.errorMessage()).toBe('');
    }));
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      productService.searchProducts.and.returnValue(of([]));
      productService.getProductsByCategory.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should filter products by category', () => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));

      component.filterByCategory(1);

      expect(productService.getProductsByCategory).toHaveBeenCalledWith(1);
      expect(component.selectedCategory()).toBe(1);
      expect(component.filteredProducts()).toEqual([mockProducts[0]]);
    });

    it('should show all products when category is null', () => {
      component.filterByCategory(null);

      expect(component.selectedCategory()).toBeNull();
      expect(component.filteredProducts()).toEqual(mockProducts);
      expect(productService.getProductsByCategory).not.toHaveBeenCalled();
    });

    it('should clear search when filtering by category', () => {
      component.searchControl.setValue('tomato');
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));

      component.filterByCategory(1);

      expect(component.searchControl.value).toBe('');
    });

    it('should handle category filter error', () => {
      const error = new Error('Filter failed');
      productService.getProductsByCategory.and.returnValue(throwError(() => error));

      component.filterByCategory(1);

      expect(component.errorMessage()).toBe('Failed to filter products. Please try again.');
      expect(component.isLoading()).toBe(false);
    });

    it('should update loading state during category filter', () => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));

      component.filterByCategory(1);

      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Clear Filters', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      productService.searchProducts.and.returnValue(of([]));
      productService.getProductsByCategory.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should clear all filters', () => {
      component.selectedCategory.set(1);
      component.searchControl.setValue('tomato');

      component.clearFilters();

      expect(component.selectedCategory()).toBeNull();
      expect(component.searchControl.value).toBe('');
      expect(component.filteredProducts()).toEqual(mockProducts);
    });

    it('should reset to all products', () => {
      component.filteredProducts.set([mockProducts[0]]);

      component.clearFilters();

      expect(component.filteredProducts()).toEqual(mockProducts);
    });

    it('should not trigger search when clearing', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([]));
      component.searchControl.setValue('tomato');
      tick(300);

      productService.searchProducts.calls.reset();

      component.clearFilters();
      tick(300);

      expect(productService.searchProducts).not.toHaveBeenCalled();
    }));
  });
});
