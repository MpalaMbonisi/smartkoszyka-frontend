import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';
import { Product } from '../../models/product.model';
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
});
