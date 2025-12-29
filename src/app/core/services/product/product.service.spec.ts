import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';
import { Category, Product } from '../../models/product.model';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

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
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
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
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProducts', () => {
    it('should fetch all products', () => {
      service.getAllProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.products}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return empty array when no products exist', () => {
      service.getAllProducts().subscribe(products => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.products}`);
      req.flush([]);
    });

    it('should handle server error', () => {
      service.getAllProducts().subscribe({
        error: error => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.products}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProductById', () => {
    it('should fetch product by id', () => {
      const productId = 1;

      service.getProductById(productId).subscribe(product => {
        expect(product).toEqual(mockProducts[0]);
        expect(product.id).toBe(productId);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.products}/${productId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts[0]);
    });

    it('should handle 404 when product not found', () => {
      const productId = 999;

      service.getProductById(productId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.products}/${productId}`
      );
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', () => {
      const query = 'pomidor';

      service.searchProducts(query).subscribe(products => {
        expect(products).toEqual([mockProducts[0]]);
        expect(products.length).toBe(1);
      });

      const req = httpMock.expectOne(
        req =>
          req.url === `${environment.apiUrl}${environment.apiEndpoints.products}/search` &&
          req.params.get('query') === query
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockProducts[0]]);
    });

    it('should return empty array when no matches found', () => {
      const query = 'nonexistent';

      service.searchProducts(query).subscribe(products => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(
        req =>
          req.url === `${environment.apiUrl}${environment.apiEndpoints.products}/search` &&
          req.params.get('query') === query
      );
      req.flush([]);
    });

    it('should handle empty query string', () => {
      const query = '';

      service.searchProducts(query).subscribe(products => {
        expect(products).toBeDefined();
      });

      const req = httpMock.expectOne(
        req =>
          req.url === `${environment.apiUrl}${environment.apiEndpoints.products}/search` &&
          req.params.get('query') === ''
      );
      req.flush([]);
    });

    it('should handle special characters in query', () => {
      const query = 'test & special';

      service.searchProducts(query).subscribe();

      const req = httpMock.expectOne(
        req =>
          req.url === `${environment.apiUrl}${environment.apiEndpoints.products}/search` &&
          req.params.get('query') === query
      );
      req.flush([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category id', () => {
      const categoryId = 1;

      service.getProductsByCategory(categoryId).subscribe(products => {
        expect(products).toEqual([mockProducts[0]]);
        expect(products[0].categoryId).toBe(categoryId);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.products}/category/${categoryId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockProducts[0]]);
    });

    it('should return empty array when category has no products', () => {
      const categoryId = 999;

      service.getProductsByCategory(categoryId).subscribe(products => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.products}/category/${categoryId}`
      );
      req.flush([]);
    });

    it('should handle invalid category id', () => {
      const categoryId = -1;

      service.getProductsByCategory(categoryId).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.products}/category/${categoryId}`
      );
      req.flush('Invalid category', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getAllCategories', () => {
    it('should fetch all categories', () => {
      service.getAllCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(categories.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.categories}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should return empty array when no categories exist', () => {
      service.getAllCategories().subscribe(categories => {
        expect(categories).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.categories}`);
      req.flush([]);
    });

    it('should handle server error', () => {
      service.getAllCategories().subscribe({
        error: error => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.categories}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
