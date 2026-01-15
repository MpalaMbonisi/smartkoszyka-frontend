import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProductCatalogComponent } from './product-catalog-component';
import { Category, Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ProductCatalogComponent (Lazy Loading)', () => {
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
      'getAllCategories',
      'searchProducts',
      'getProductsByCategory',
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent, ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: productServiceSpy }],
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;

    productService.getAllCategories.and.returnValue(of(mockCategories));
    productService.searchProducts.and.returnValue(of([]));
    productService.getProductsByCategory.and.returnValue(of([]));

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load categories on init', () => {
      fixture.detectChanges();

      expect(productService.getAllCategories).toHaveBeenCalled();
      expect(component.categories()).toEqual(mockCategories);
    });

    it('should NOT load products on init', () => {
      fixture.detectChanges();

      expect(productService.getProductsByCategory).not.toHaveBeenCalled();
      expect(component.products()).toEqual([]);
    });

    it('should show empty state by default', () => {
      fixture.detectChanges();

      expect(component.showEmptyState()).toBe(true);
      expect(component.products().length).toBe(0);
    });

    it('should display empty state message', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');

      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('Select a Category');
    });
  });

  describe('Lazy Loading Products', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load products only when category is selected', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);

      expect(productService.getProductsByCategory).toHaveBeenCalledWith(1);
      expect(component.products()).toEqual(mockProducts);
    });

    it('should NOT load all products when category is null', () => {
      component.filterByCategory(null);

      expect(productService.getProductsByCategory).not.toHaveBeenCalled();
      expect(component.products()).toEqual([]);
    });

    it('should hide empty state after loading products', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);

      expect(component.showEmptyState()).toBe(false);
    });

    it('should set loading state while fetching products', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);

      expect(component.isLoading()).toBe(false); // After completion
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter products by category', () => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));

      component.filterByCategory(1);

      expect(productService.getProductsByCategory).toHaveBeenCalledWith(1);
      expect(component.selectedCategory()).toBe(1);
      expect(component.products()).toEqual([mockProducts[0]]);
    });

    it('should clear search when filtering by category', () => {
      component.searchControl.setValue('test');
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
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search products with debounce', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('pomidor');
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('pomidor');
      expect(component.products()).toEqual([mockProducts[0]]);
    }));

    it('should hide empty state when searching', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.searchControl.setValue('pomidor');
      tick(300);

      expect(component.showEmptyState()).toBe(false);
    }));

    it('should clear category selection when searching', fakeAsync(() => {
      productService.getProductsByCategory.and.returnValue(of([mockProducts[0]]));
      component.filterByCategory(1);

      productService.searchProducts.and.returnValue(of([mockProducts[0]]));
      component.searchControl.setValue('test');
      tick(300);

      expect(component.selectedCategory()).toBeNull();
    }));

    it('should not search with empty query', fakeAsync(() => {
      component.searchControl.setValue('   ');
      tick(300);

      expect(productService.searchProducts).not.toHaveBeenCalled();
    }));

    it('should handle search error', fakeAsync(() => {
      productService.searchProducts.and.returnValue(throwError(() => new Error('Search failed')));

      component.searchControl.setValue('test');
      tick(300);

      expect(component.errorMessage()).toBe('Search failed. Please try again.');
    }));
  });

  describe('Clear Filters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear all filters and show empty state', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));
      component.filterByCategory(1);

      component.clearFilters();

      expect(component.selectedCategory()).toBeNull();
      expect(component.searchControl.value).toBe('');
      expect(component.products()).toEqual([]);
      expect(component.showEmptyState()).toBe(true);
    });

    it('should clear search query', () => {
      component.searchControl.setValue('test');

      component.clearFilters();

      expect(component.searchControl.value).toBe('');
    });
  });

  describe('UI Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display empty state initially', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');

      expect(emptyState).toBeTruthy();
    });

    it('should display category filters', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const filterChips = compiled.querySelectorAll('.filter-chip');

      // +1 for "Clear Filter" button
      expect(filterChips.length).toBe(mockCategories.length + 1);
    });

    it('should display products after category selection', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const productCards = compiled.querySelectorAll('.product-card');

      expect(productCards.length).toBe(mockProducts.length);
    });

    it('should NOT display products before category selection', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const productCards = compiled.querySelectorAll('.product-card');

      expect(productCards.length).toBe(0);
    });

    it('should show loading state', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingState = compiled.querySelector('.loading-state');

      expect(loadingState).toBeTruthy();
      expect(loadingState?.textContent).toContain('Loading products');
    });

    it('should highlight active category', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const filterChips = compiled.querySelectorAll('.filter-chip');
      const activeChip = Array.from(filterChips).find(
        chip => chip.classList.contains('active') && chip.textContent?.includes('Warzywa')
      );

      expect(activeChip).toBeTruthy();
    });
  });

  describe('Performance Optimization', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should NOT make unnecessary API calls on init', () => {
      expect(productService.getProductsByCategory).not.toHaveBeenCalled();
    });

    it('should only load products for selected category', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);

      expect(productService.getProductsByCategory).toHaveBeenCalledTimes(1);
      expect(productService.getProductsByCategory).toHaveBeenCalledWith(1);
    });

    it('should handle rapid category switching', () => {
      productService.getProductsByCategory.and.returnValue(of(mockProducts));

      component.filterByCategory(1);
      component.filterByCategory(2);
      component.filterByCategory(null);

      expect(productService.getProductsByCategory).toHaveBeenCalledTimes(2);
    });
  });
});
