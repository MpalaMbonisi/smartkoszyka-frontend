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

    productService.getAllProducts.and.returnValue(of([]));
    productService.getAllCategories.and.returnValue(of([]));
    productService.searchProducts.and.returnValue(of([]));
    productService.getProductsByCategory.and.returnValue(of([]));

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

  describe('Product Selection', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      fixture.detectChanges();
    });

    it('should handle product selection', () => {
      spyOn(console, 'log');

      component.onProductSelect(mockProducts[0]);

      expect(console.log).toHaveBeenCalledWith('Product selected:', mockProducts[0]);
    });
  });

  describe('UI Rendering', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      fixture.detectChanges();
    });

    it('should display product catalog title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('.catalog-header h2');

      expect(title?.textContent).toBe('Product Catalog');
    });

    it('should display search input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('.search-input') as HTMLInputElement;

      expect(searchInput).toBeTruthy();
      expect(searchInput.placeholder).toContain('Search products');
    });

    it('should display category filter chips', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const filterChips = compiled.querySelectorAll('.filter-chip');

      expect(filterChips.length).toBe(mockCategories.length + 1); // +1 for "All Products"
    });

    it('should display products in grid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const productCards = compiled.querySelectorAll('.product-card');

      expect(productCards.length).toBe(mockProducts.length);
    });

    it('should display product details', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.product-card');
      const productName = firstCard?.querySelector('.product-name');
      const productPrice = firstCard?.querySelector('.price');

      expect(productName?.textContent).toContain('Pomidory');
      expect(productPrice?.textContent).toContain('5.99');
    });

    it('should show loading state', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingState = compiled.querySelector('.loading-state');

      expect(loadingState).toBeTruthy();
      expect(loadingState?.textContent).toContain('Loading products');
    });

    it('should show error banner', () => {
      component.errorMessage.set('Test error');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorBanner = compiled.querySelector('.error-banner');

      expect(errorBanner).toBeTruthy();
      expect(errorBanner?.textContent).toContain('Test error');
    });

    it('should show empty state when no products', () => {
      component.filteredProducts.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');

      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('No products found');
    });

    it('should show clear filters button when filters are active', () => {
      component.selectedCategory.set(1);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.clear-filters');

      expect(clearButton).toBeTruthy();
    });

    it('should not show clear filters button when no filters active', () => {
      component.selectedCategory.set(null);
      component.searchControl.setValue('', { emitEvent: false });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.clear-filters');

      expect(clearButton).toBeFalsy();
    });

    it('should highlight active category', () => {
      component.selectedCategory.set(1);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const filterChips = compiled.querySelectorAll('.filter-chip');
      const activeChip = Array.from(filterChips).find(chip => chip.classList.contains('active'));

      expect(activeChip).toBeTruthy();
    });

    it('should display product images', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const images = compiled.querySelectorAll(
        '.product-image img'
      ) as NodeListOf<HTMLImageElement>;

      expect(images.length).toBe(mockProducts.length);
      expect(images[0].src).toContain('pomidory.jpg');
    });

    it('should display product brand', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const brand = compiled.querySelector('.product-brand');

      expect(brand?.textContent).toContain('Biedronka');
    });

    it('should display product unit', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const unit = compiled.querySelector('.unit');

      expect(unit?.textContent).toContain('kg');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of(mockCategories));
      fixture.detectChanges();
    });

    it('should filter when category chip clicked', () => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));
      const compiled = fixture.nativeElement as HTMLElement;
      const filterChip = compiled.querySelectorAll('.filter-chip')[1] as HTMLButtonElement;

      filterChip.click();

      expect(productService.getProductsByCategory).toHaveBeenCalled();
    });

    it('should clear filters when clear button clicked', () => {
      component.selectedCategory.set(1);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('.clear-filters') as HTMLButtonElement;

      clearButton.click();

      expect(component.selectedCategory()).toBeNull();
    });

    it('should trigger product selection when card clicked', () => {
      spyOn(component, 'onProductSelect');
      const compiled = fixture.nativeElement as HTMLElement;
      const productCard = compiled.querySelector('.product-card') as HTMLElement;

      productCard.click();

      expect(component.onProductSelect).toHaveBeenCalled();
    });

    it('should search when typing in search input', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('.search-input') as HTMLInputElement;

      searchInput.value = 'tomato';
      searchInput.dispatchEvent(new Event('input'));
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('tomato');
    }));
  });

  describe('Edge Cases', () => {
    it('should handle empty categories list', () => {
      productService.getAllProducts.and.returnValue(of(mockProducts));
      productService.getAllCategories.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.categories()).toEqual([]);
    });

    it('should handle empty products list', () => {
      productService.getAllProducts.and.returnValue(of([]));
      productService.getAllCategories.and.returnValue(of(mockCategories));

      fixture.detectChanges();

      expect(component.products()).toEqual([]);
      expect(component.filteredProducts()).toEqual([]);
    });

    it('should handle rapid category switching', () => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));

      component.filterByCategory(1);
      component.filterByCategory(2);
      component.filterByCategory(null);

      expect(component.selectedCategory()).toBeNull();
    });

    it('should handle search while category is selected', fakeAsync(() => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));
      component.filterByCategory(1);
      tick();

      fixture.detectChanges();

      component.searchControl.setValue('pomidor');
      tick(300);

      fixture.detectChanges();

      expect(productService.searchProducts).toHaveBeenCalled();
    }));
  });
});
