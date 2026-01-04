import { TestBed } from '@angular/core/testing';

import { ProductSelectionService } from '../product-selection/product-selection-service';
import { Product } from '../../models/product.model';

describe('ProductSelectionService', () => {
  let service: ProductSelectionService;

  const mockProduct: Product = {
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
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with no selected product', () => {
      expect(service.getSelectedProduct()).toBeNull();
    });

    it('should initialize with list selector hidden', () => {
      expect(service.showListSelector()).toBe(false);
    });
  });

  describe('selectProduct', () => {
    it('should set selected product', () => {
      service.selectProduct(mockProduct);

      expect(service.getSelectedProduct()).toEqual(mockProduct);
    });

    it('should show list selector', () => {
      service.selectProduct(mockProduct);

      expect(service.showListSelector()).toBe(true);
    });

    it('should update selected product when called multiple times', () => {
      const anotherProduct: Product = { ...mockProduct, id: 2, name: 'Banany' };

      service.selectProduct(mockProduct);
      expect(service.getSelectedProduct()).toEqual(mockProduct);

      service.selectProduct(anotherProduct);
      expect(service.getSelectedProduct()).toEqual(anotherProduct);
    });
  });

  describe('clearSelection', () => {
    it('should clear selected product', () => {
      service.selectProduct(mockProduct);
      expect(service.getSelectedProduct()).not.toBeNull();

      service.clearSelection();
      expect(service.getSelectedProduct()).toBeNull();
    });

    it('should hide list selector', () => {
      service.selectProduct(mockProduct);
      expect(service.showListSelector()).toBe(true);

      service.clearSelection();
      expect(service.showListSelector()).toBe(false);
    });

    it('should handle clearing when nothing is selected', () => {
      service.clearSelection();

      expect(service.getSelectedProduct()).toBeNull();
      expect(service.showListSelector()).toBe(false);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update showListSelector signal reactively', () => {
      const initialValue = service.showListSelector();
      expect(initialValue).toBe(false);

      service.selectProduct(mockProduct);
      const updatedValue = service.showListSelector();
      expect(updatedValue).toBe(true);
    });

    it('should maintain selected product state across multiple operations', () => {
      service.selectProduct(mockProduct);
      const product1 = service.getSelectedProduct();

      expect(product1).toEqual(mockProduct);

      const product2 = service.getSelectedProduct();
      expect(product2).toEqual(product1);
    });
  });

  describe('Use Case Scenarios', () => {
    it('should handle typical user flow: select, clear, select again', () => {
      // First selection
      service.selectProduct(mockProduct);
      expect(service.getSelectedProduct()).toEqual(mockProduct);
      expect(service.showListSelector()).toBe(true);

      // Clear
      service.clearSelection();
      expect(service.getSelectedProduct()).toBeNull();
      expect(service.showListSelector()).toBe(false);

      // Second selection
      service.selectProduct(mockProduct);
      expect(service.getSelectedProduct()).toEqual(mockProduct);
      expect(service.showListSelector()).toBe(true);
    });

    it('should handle rapid product selections', () => {
      const products: Product[] = [
        mockProduct,
        { ...mockProduct, id: 2, name: 'Banany' },
        { ...mockProduct, id: 3, name: 'Mleko' },
      ];

      products.forEach(product => {
        service.selectProduct(product);
        expect(service.getSelectedProduct()).toEqual(product);
        expect(service.showListSelector()).toBe(true);
      });
    });
  });
});
