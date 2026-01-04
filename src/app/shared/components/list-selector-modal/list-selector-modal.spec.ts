import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSelectorModal } from './list-selector-modal';
import { ProductSelectionService } from '../../../core/services/product-selection/product-selection-service';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';
import { Product } from '../../../core/models/product.model';

describe('ListSelectorModal', () => {
  let component: ListSelectorModal;
  let fixture: ComponentFixture<ListSelectorModal>;
  let productSelectionService: ProductSelectionService;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;
  let router: jasmine.SpyObj<Router>;

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

  const mockNewItem: ShoppingListItem = {
    listItemId: 1,
    productId: 1,
    productName: 'Pomidory',
    quantity: 3,
    unit: 'kg',
    priceAtAddition: 5.99,
    isChecked: false,
    addedAt: '2025-01-01T10:00:00',
  };

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
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

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

  describe('Form Validation', () => {
    beforeEach(() => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();
    });

    it('should require list selection', () => {
      const listId = component.addToListForm.get('listId');

      expect(listId?.valid).toBeFalsy();
      expect(listId?.hasError('required')).toBeTruthy();
    });

    it('should require quantity', () => {
      const quantity = component.addToListForm.get('quantity');

      component.addToListForm.patchValue({ quantity: null });

      expect(quantity?.hasError('required')).toBeTruthy();
    });

    it('should require minimum quantity of 1', () => {
      const quantity = component.addToListForm.get('quantity');

      component.addToListForm.patchValue({ quantity: 0 });

      expect(quantity?.hasError('min')).toBeTruthy();
    });

    it('should be valid with list and quantity', () => {
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      expect(component.addToListForm.valid).toBeTruthy();
    });
  });

  describe('Adding Product to List', () => {
    beforeEach(() => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();
    });

    it('should add product to selected list', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockNewItem));
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      component.onAddToList();

      expect(shoppingListService.addProductToList).toHaveBeenCalledWith(1, {
        productId: 1,
        quantity: 3,
      });
    });

    it('should show success message after adding', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockNewItem));
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      component.onAddToList();

      expect(component.successMessage()).toBe('Product added successfully!');
    });

    it('should close modal after successful add', done => {
      shoppingListService.addProductToList.and.returnValue(of(mockNewItem));
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      spyOn(component, 'onClose');

      component.onAddToList();

      setTimeout(() => {
        expect(component.onClose).toHaveBeenCalled();
        done();
      }, 1600);
    });

    it('should reset form after adding', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockNewItem));
      component.addToListForm.patchValue({ listId: 1, quantity: 5 });

      component.onAddToList();

      expect(component.addToListForm.value.quantity).toBe(1);
    });

    it('should not add with invalid form', () => {
      component.addToListForm.patchValue({ listId: null, quantity: 0 });

      component.onAddToList();

      expect(shoppingListService.addProductToList).not.toHaveBeenCalled();
    });

    it('should handle error when adding fails', () => {
      const error = { message: 'Product already in list' };
      shoppingListService.addProductToList.and.returnValue(throwError(() => error));
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      component.onAddToList();

      expect(component.errorMessage()).toBe('Product already in list');
      expect(component.isSubmitting()).toBe(false);
    });

    it('should set submitting state during add operation', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockNewItem));
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });

      component.onAddToList();

      expect(component.isSubmitting()).toBe(false); // After completion
    });
  });

  describe('Modal Actions', () => {
    beforeEach(() => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();
    });

    it('should close modal when close button clicked', () => {
      spyOn(productSelectionService, 'clearSelection');

      component.onClose();

      expect(productSelectionService.clearSelection).toHaveBeenCalled();
    });

    it('should reset form when closing', () => {
      component.addToListForm.patchValue({ listId: 1, quantity: 5 });

      component.onClose();

      expect(component.addToListForm.value).toEqual({
        listId: null,
        quantity: 1,
      });
    });

    it('should clear messages when closing', () => {
      component.errorMessage.set('Error');
      component.successMessage.set('Success');

      component.onClose();

      expect(component.errorMessage()).toBe('');
      expect(component.successMessage()).toBe('');
    });

    it('should close modal on overlay click', () => {
      spyOn(component, 'onClose');
      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.modal-overlay') as HTMLElement;

      overlay.click();

      expect(component.onClose).toHaveBeenCalled();
    });

    it('should not close modal on content click', () => {
      spyOn(component, 'onClose');
      const compiled = fixture.nativeElement as HTMLElement;
      const content = compiled.querySelector('.modal-content') as HTMLElement;

      content.click();

      expect(component.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Create New List Action', () => {
    beforeEach(() => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();
    });

    it('should navigate to shopping lists page', () => {
      component.onCreateNewList();

      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists']);
    });

    it('should close modal after navigation', () => {
      spyOn(component, 'onClose');

      component.onCreateNewList();

      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of([]));
      productSelectionService.selectProduct(mockProduct);
    });

    it('should show empty state when no lists exist', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');

      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain("You don't have any active shopping lists");
    });

    it('should show create list button in empty state', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const createBtn = compiled.querySelector('.empty-state button');

      expect(createBtn).toBeTruthy();
      expect(createBtn?.textContent).toContain('Create New List');
    });
  });

  describe('UI Rendering', () => {
    beforeEach(() => {
      productSelectionService.selectProduct(mockProduct);
      fixture.detectChanges();
    });

    it('should display modal header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.modal-header h3');

      expect(header?.textContent).toBe('Add Product to List');
    });

    it('should display list dropdown', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const select = compiled.querySelector('#listId');

      expect(select).toBeTruthy();
    });

    it('should display quantity input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('#quantity');

      expect(input).toBeTruthy();
    });

    it('should display submit button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]');

      expect(submitBtn).toBeTruthy();
    });

    it('should display cancel button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector('button[type="button"]');

      expect(cancelBtn).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitBtn.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.addToListForm.patchValue({ listId: 1, quantity: 3 });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitBtn.disabled).toBeFalsy();
    });
  });
});
