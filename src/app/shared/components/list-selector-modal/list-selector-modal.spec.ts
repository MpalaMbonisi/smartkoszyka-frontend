import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSelectorModal } from './list-selector-modal';
import { ProductSelectionService } from '../../../core/services/product-selection/product-selection-service';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ShoppingList } from '../../../core/models/shopping-list.model';
import { Product } from '../../../core/models/product.model';

describe('ListSelectorModal', () => {
  let component: ListSelectorModal;
  let fixture: ComponentFixture<ListSelectorModal>;
  let productSelectionService: ProductSelectionService;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;

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

  const mockLists: ShoppingList[] = [
    {
      listId: 1,
      title: 'Weekly Groceries',
      description: 'Shopping for the week',
      isArchived: false,
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
    },
    {
      listId: 2,
      title: 'Party Supplies',
      description: 'Items for birthday',
      isArchived: false,
      createdAt: '2025-01-02T10:00:00',
      updatedAt: '2025-01-02T10:00:00',
    },
  ];

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getActiveShoppingLists',
      'addProductToList',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListSelectorModal, ReactiveFormsModule],
      providers: [
        ProductSelectionService,
        { provide: ShoppingListService, useValue: shoppingListServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    productSelectionService = TestBed.inject(ProductSelectionService);
    shoppingListService = TestBed.inject(
      ShoppingListService
    ) as jasmine.SpyObj<ShoppingListService>;

    shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));

    fixture = TestBed.createComponent(ListSelectorModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load active lists on init', () => {
      fixture.detectChanges();

      expect(shoppingListService.getActiveShoppingLists).toHaveBeenCalled();
      expect(component.activeLists()).toEqual(mockLists);
    });

    it('should initialize form with default quantity of 1', () => {
      fixture.detectChanges();

      expect(component.addToListForm.value).toEqual({
        listId: null,
        quantity: 1,
      });
    });

    it('should handle error when loading lists fails', () => {
      const error = new Error('Failed to load');
      shoppingListService.getActiveShoppingLists.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Failed to load shopping lists.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Modal Visibility', () => {
    it('should show modal when product is selected', () => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const modal = compiled.querySelector('.modal-overlay');

      expect(modal).toBeTruthy();
    });

    it('should hide modal when showListSelector is false', () => {
      productSelectionService.clearSelection();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const modal = compiled.querySelector('.modal-overlay');

      expect(modal).toBeFalsy();
    });
  });

  describe('Product Preview', () => {
    it('should display selected product information', () => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const productPreview = compiled.querySelector('.product-preview');

      expect(productPreview?.textContent).toContain('Pomidory');
      expect(productPreview?.textContent).toContain('5.99');
    });

    it('should get selected product from service', () => {
      productSelectionService.selectProduct(mockProduct);

      expect(component.selectedProduct).toEqual(mockProduct);
    });
  });
});
