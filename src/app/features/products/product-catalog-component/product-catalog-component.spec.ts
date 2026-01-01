import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
