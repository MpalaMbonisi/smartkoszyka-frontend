import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ShoppingListDetailComponent } from './shopping-list-detail-component';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';

describe('ShoppingListDetailComponent', () => {
  let component: ShoppingListDetailComponent;
  let fixture: ComponentFixture<ShoppingListDetailComponent>;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockList: ShoppingList = {
    listId: 1,
    title: 'Weekly Groceries',
    description: 'Shopping for the week',
    isArchived: false,
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00',
  };

  const mockItems: ShoppingListItem[] = [
    {
      listItemId: 1,
      productId: 1,
      productName: 'Pomidory',
      quantity: 3,
      unit: 'kg',
      priceAtAddition: 5.99,
      isChecked: false,
      addedAt: '2025-01-01T10:00:00',
    },
    {
      listItemId: 2,
      productId: 2,
      productName: 'Banany',
      quantity: 2,
      unit: 'kg',
      priceAtAddition: 4.99,
      isChecked: true,
      addedAt: '2025-01-01T10:05:00',
    },
  ];

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
  ];

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getShoppingListById',
      'getShoppingListItems',
      'addProductToList',
      'updateItemQuantity',
      'toggleItemChecked',
      'removeItemFromList',
      'updateShoppingListTitle',
    ]);

    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts',
      'searchProducts',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShoppingListDetailComponent, ReactiveFormsModule],
      providers: [
        { provide: ShoppingListService, useValue: shoppingListServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    shoppingListService = TestBed.inject(
      ShoppingListService
    ) as jasmine.SpyObj<ShoppingListService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    shoppingListService.getShoppingListById.and.returnValue(of(mockList));
    shoppingListService.getShoppingListItems.and.returnValue(of(mockItems));
    productService.getAllProducts.and.returnValue(of(mockProducts));

    fixture = TestBed.createComponent(ShoppingListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load list details on init', () => {
      expect(shoppingListService.getShoppingListById).toHaveBeenCalledWith(1);
      expect(component.shoppingList()).toEqual(mockList);
    });

    it('should load list items on init', () => {
      expect(shoppingListService.getShoppingListItems).toHaveBeenCalledWith(1);
      expect(component.items()).toEqual(mockItems);
    });

    it('should load all products on init', () => {
      expect(productService.getAllProducts).toHaveBeenCalled();
      expect(component.availableProducts()).toEqual(mockProducts);
    });

    it('should extract listId from route params', () => {
      expect(component.listId).toBe(1);
    });

    it('should handle missing listId in route', () => {
      const invalidRoute = {
        snapshot: { paramMap: { get: () => null } },
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ShoppingListDetailComponent],
        providers: [
          { provide: ShoppingListService, useValue: shoppingListService },
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: invalidRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ShoppingListDetailComponent);
      newFixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle error loading list', () => {
      const error = new Error('Not found');
      shoppingListService.getShoppingListById.and.returnValue(throwError(() => error));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ShoppingListDetailComponent],
        providers: [
          { provide: ShoppingListService, useValue: shoppingListService },
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ShoppingListDetailComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.errorMessage()).toBe('Failed to load shopping list.');
    });
  });

  describe('Calculate Total', () => {
    it('should calculate total price correctly', () => {
      expect(component.totalPrice()).toBeCloseTo(27.95, 2); // (3 * 5.99) + (2 * 4.99)
    });

    it('should return 0 for empty list', () => {
      component.items.set([]);
      expect(component.totalPrice()).toBe(0);
    });

    it('should update when items change', () => {
      const newItems: ShoppingListItem[] = [{ ...mockItems[0], quantity: 5 }];
      component.items.set(newItems);
      expect(component.totalPrice()).toBeCloseTo(29.95, 2);
    });
  });

  describe('Calculate Checked/Unchecked Items', () => {
    it('should count checked items correctly', () => {
      expect(component.checkedCount()).toBe(1);
    });

    it('should count unchecked items correctly', () => {
      expect(component.uncheckedCount()).toBe(1);
    });

    it('should return 0 for empty list', () => {
      component.items.set([]);
      expect(component.checkedCount()).toBe(0);
      expect(component.uncheckedCount()).toBe(0);
    });
  });

  describe('Toggle Add Product View', () => {
    it('should toggle showAddProduct flag', () => {
      expect(component.showAddProduct()).toBe(false);

      component.toggleAddProduct();
      expect(component.showAddProduct()).toBe(true);

      component.toggleAddProduct();
      expect(component.showAddProduct()).toBe(false);
    });

    it('should reset search when closing', () => {
      component.productSearchControl.setValue('test');
      component.showAddProduct.set(true);

      component.toggleAddProduct();

      expect(component.productSearchControl.value).toBe('');
    });
  });

  describe('Search Products', () => {
    it('should filter products by search query', fakeAsync(() => {
      productService.searchProducts.and.returnValue(of([mockProducts[0]]));

      component.productSearchControl.setValue('pomidor');
      tick(300);

      expect(productService.searchProducts).toHaveBeenCalledWith('pomidor');
      expect(component.filteredProducts()).toEqual([mockProducts[0]]);
    }));

    it('should show all products when search is empty', fakeAsync(() => {
      component.productSearchControl.setValue('');
      tick(300);

      expect(component.filteredProducts()).toEqual(mockProducts);
    }));

    it('should handle search error', fakeAsync(() => {
      productService.searchProducts.and.returnValue(throwError(() => new Error('Search failed')));

      component.productSearchControl.setValue('test');
      tick(300);

      expect(component.errorMessage()).toBe('Failed to search products.');
    }));
  });

  describe('Add Product to List', () => {
    it('should add product with valid quantity', () => {
      const newItem: ShoppingListItem = {
        listItemId: 3,
        productId: 3,
        productName: 'Mleko',
        quantity: 2,
        unit: 'l',
        priceAtAddition: 3.99,
        isChecked: false,
        addedAt: '2025-01-02T10:00:00',
      };

      shoppingListService.addProductToList.and.returnValue(of(newItem));
      component.addProductForm.patchValue({ productId: 3, quantity: 2 });

      component.onAddProduct();

      expect(shoppingListService.addProductToList).toHaveBeenCalledWith(1, {
        productId: 3,
        quantity: 2,
      });
    });

    it('should add new item to items list', () => {
      const newItem: ShoppingListItem = { ...mockItems[0], listItemId: 3 };
      shoppingListService.addProductToList.and.returnValue(of(newItem));
      component.addProductForm.patchValue({ productId: 3, quantity: 2 });

      const initialCount = component.items().length;
      component.onAddProduct();

      expect(component.items().length).toBe(initialCount + 1);
    });

    it('should reset form after adding product', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockItems[0]));
      component.addProductForm.patchValue({ productId: 1, quantity: 2 });

      component.onAddProduct();

      expect(component.addProductForm.value).toEqual({
        productId: null,
        quantity: 1,
      });
    });

    it('should close add product view after adding', () => {
      shoppingListService.addProductToList.and.returnValue(of(mockItems[0]));
      component.addProductForm.patchValue({ productId: 1, quantity: 2 });
      component.showAddProduct.set(true);

      component.onAddProduct();

      expect(component.showAddProduct()).toBe(false);
    });

    it('should not add product with invalid form', () => {
      component.addProductForm.patchValue({ productId: null, quantity: 0 });

      component.onAddProduct();

      expect(shoppingListService.addProductToList).not.toHaveBeenCalled();
    });

    it('should handle add product error', () => {
      const error = new Error('Product already in list');
      shoppingListService.addProductToList.and.returnValue(throwError(() => error));
      component.addProductForm.patchValue({ productId: 1, quantity: 2 });

      component.onAddProduct();

      expect(component.errorMessage()).toBe('Product already in list');
    });

    it('should show success message after adding', fakeAsync(() => {
      shoppingListService.addProductToList.and.returnValue(of(mockItems[0]));
      component.addProductForm.patchValue({ productId: 1, quantity: 2 });

      component.onAddProduct();

      expect(component.successMessage()).toBe('Product added successfully!');

      tick(3000);
      expect(component.successMessage()).toBe('');
    }));
  });

  describe('Update Item Quantity', () => {
    it('should update item quantity', () => {
      const updatedItem = { ...mockItems[0], quantity: 5 };
      shoppingListService.updateItemQuantity.and.returnValue(of(updatedItem));

      component.onUpdateQuantity(1, 5);

      expect(shoppingListService.updateItemQuantity).toHaveBeenCalledWith(1, { quantity: 5 });
    });

    it('should update item in list after successful update', () => {
      const updatedItem = { ...mockItems[0], quantity: 5 };
      shoppingListService.updateItemQuantity.and.returnValue(of(updatedItem));

      component.onUpdateQuantity(1, 5);

      const item = component.items().find(i => i.listItemId === 1);
      expect(item?.quantity).toBe(5);
    });

    it('should handle update quantity error', () => {
      const error = new Error('Update failed');
      shoppingListService.updateItemQuantity.and.returnValue(throwError(() => error));

      component.onUpdateQuantity(1, 5);

      expect(component.errorMessage()).toBe('Failed to update quantity.');
    });

    it('should not update with invalid quantity', () => {
      component.onUpdateQuantity(1, 0);

      expect(shoppingListService.updateItemQuantity).not.toHaveBeenCalled();
    });
  });

  describe('Toggle Item Checked', () => {
    it('should toggle item checked status', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));

      component.onToggleChecked(1);

      expect(shoppingListService.toggleItemChecked).toHaveBeenCalledWith(1);
    });

    it('should update item checked status in list', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));
      const initialStatus = mockItems[0].isChecked;

      component.onToggleChecked(1);

      const item = component.items().find(i => i.listItemId === 1);
      expect(item?.isChecked).toBe(!initialStatus);
    });

    it('should handle toggle error', () => {
      const error = new Error('Toggle failed');
      shoppingListService.toggleItemChecked.and.returnValue(throwError(() => error));

      component.onToggleChecked(1);

      expect(component.errorMessage()).toBe('Failed to update item status.');
    });
  });

  describe('Remove Item', () => {
    it('should remove item from list', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.removeItemFromList.and.returnValue(of(undefined));

      component.onRemoveItem(1);

      expect(shoppingListService.removeItemFromList).toHaveBeenCalledWith(1);
    });

    it('should remove item from items array', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.removeItemFromList.and.returnValue(of(undefined));

      const initialCount = component.items().length;
      component.onRemoveItem(1);

      expect(component.items().length).toBe(initialCount - 1);
      expect(component.items().find(i => i.listItemId === 1)).toBeUndefined();
    });

    it('should not remove if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onRemoveItem(1);

      expect(shoppingListService.removeItemFromList).not.toHaveBeenCalled();
    });

    it('should handle remove error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Remove failed');
      shoppingListService.removeItemFromList.and.returnValue(throwError(() => error));

      component.onRemoveItem(1);

      expect(component.errorMessage()).toBe('Failed to remove item.');
    });

    it('should show success message after removal', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.removeItemFromList.and.returnValue(of(undefined));

      component.onRemoveItem(1);

      expect(component.successMessage()).toBe('Item removed successfully!');

      tick(3000);
      expect(component.successMessage()).toBe('');
    }));
  });
});
